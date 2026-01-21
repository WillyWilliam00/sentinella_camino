import { app, shell, BrowserWindow, ipcMain, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { Client } from 'ssh2'
import dotenv from 'dotenv'
import { Notification } from 'electron'

// Carica le variabili d'ambiente dal file .env
if (is.dev) {
  // In sviluppo: carica dalla root del progetto
  dotenv.config()
} else {
  // In produzione: carica dalla cartella resources
  const envPath = join(process.resourcesPath, '.env')
  dotenv.config({ path: envPath })
  console.log('Caricato .env da:', envPath)
}
let mainWindow: BrowserWindow | null = null

/**
 * Crea e configura la finestra principale dell'applicazione Electron.
 * Imposta le dimensioni, l'icona, i webPreferences e carica il contenuto
 * (URL di sviluppo o file HTML in produzione).
 */
function createWindow(): void {

  let iconPath: string
  iconPath = is.dev 
  ? join(__dirname, '../../build/icon.png')
  : join(process.resourcesPath, 'build/icon.png')

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? {  } : {}),
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })
  

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * Esegue una connessione SSH per scattare una foto di test sul dispositivo mobile.
 * Esegue lo script test_foto.py che scatta una foto immediata e la invia a N8N.
 * Utilizzato per test manuali dello scatto foto senza attendere il ciclo automatico.
 */
function scattaFotoSSH() {
  const conn = new Client()
  
  conn.on('ready', () => {
    console.log('Connesso al server SSH')
    conn.exec('python ~/test_foto.py', (err, stream) => {
      if(err) {
        console.error('Errore durante l\'esecuzione del comando:', err)
        conn.end()
        return
      }
      stream.on('close', () => {
        console.log('Comando eseguito, connessione chiusa')
        conn.end()
      })
    })
  })

  conn.on('error', (err) => {
    console.error('Errore di connessione SSH:', err)
  })

  conn.connect({
    host: process.env.HOST_SSH || '',
    port: parseInt(process.env.PORT_SSH || '22', 10),
    username: process.env.USERNAME_SSH || '',
    password: process.env.PASSWORD_SSH || ''
  })
}

/**
 * Avvia lo script Python principale sul dispositivo mobile tramite SSH.
 * Esegue mobile_script.py che monitora continuamente il camino scattando foto
 * ogni 30 minuti e inviando informazioni del dispositivo ogni minuto.
 * Utilizza termux-wake-lock per mantenere il dispositivo sveglio durante l'esecuzione.
 */
function collegaDispositivoSSH() {
  const conn = new Client()
  
  conn.on('ready', () => {
    console.log('Connesso al server SSH')
    conn.exec('termux-wake-lock && python ~/mobile_script.py', (err, stream) => {
      if(err) {
        console.error('Errore durante l\'esecuzione del comando:', err)
        conn.end()
        return
      }
      stream.on('close', () => {
        console.log('Comando eseguito, connessione chiusa')
        conn.end()
      })
    })
  })

  conn.on('error', (err) => {
    console.error('Errore di connessione SSH:', err)
  })

  conn.connect({
    host: process.env.HOST_SSH || '',
    port: parseInt(process.env.PORT_SSH || '22', 10),
    username: process.env.USERNAME_SSH || '',
    password: process.env.PASSWORD_SSH || ''
  })
}

/**
 * Termina lo script Python in esecuzione e sblocca il dispositivo mobile.
 * Esegue termux-wake-unlock per sbloccare il dispositivo e pkill python
 * per terminare tutti i processi Python in esecuzione.
 */
function scollegaDispositivoSSH() {
  const conn = new Client()
  
  conn.on('ready', () => {
    console.log('Connesso al server SSH!!')
    conn.exec('termux-wake-unlock && pkill python', (err, stream) => {
      if(err) { 
        console.error('Errore durante l\'esecuzione del comando:', err)
        conn.end()
        return
      }
      stream.on('close', () => {
        console.log('Comando eseguito, connessione chiusa')
        conn.end()
      })
    })
  })

  conn.on('error', (err) => {
    console.error('Errore di connessione SSH:', err)
  })

  conn.connect({
    host: process.env.HOST_SSH || '',
    port: parseInt(process.env.PORT_SSH || '22', 10),
    username: process.env.USERNAME_SSH || '',
    password: process.env.PASSWORD_SSH || ''
  })
}

/**
 * Verifica se lo script Python è in esecuzione sul dispositivo mobile.
 * Esegue il comando 'pgrep python' via SSH e invia il risultato al renderer
 * tramite IPC. Utilizzato per aggiornare lo stato di connessione nell'interfaccia.
 */
function checkPythonRunning() {
  const conn = new Client()
  let isRunning = false
  conn.on('ready', () => {
    console.log('Connesso al server SSH')
    conn.exec('pgrep python', (err, stream) => {
      if (err) {
        console.error('Errore durante l\'esecuzione del comando:', err)
        // In caso di errore, consideriamo Python non in esecuzione
        mainWindow?.webContents?.send('python-running', isRunning)
        conn.end()
        return
      }
      stream.on('data', (data) => {
        if (data.toString().trim() !== '') {
          isRunning = true
        }
      })
      stream.on('close', () => {
        mainWindow?.webContents?.send('python-running', isRunning)
        console.log('Comando eseguito, connessione chiusa')
        conn.end()
      })
    })
  }).connect({
    host: process.env.HOST_SSH || '',
    port: parseInt(process.env.PORT_SSH || '22', 10),
    username: process.env.USERNAME_SSH || '',
    password: process.env.PASSWORD_SSH || ''
  })
}
function mostraNotificaTelefonoScarico() {
  let iconPath: string
  iconPath = is.dev 
  ? join(__dirname, '../../build/icon.png')
  : join(process.resourcesPath, 'build/icon.png')
  const icon = nativeImage.createFromPath(iconPath) 
  
  const notifica = new Notification({
    title: 'Dispositivo al 20% di batteria',
    body: 'Il dispositivo è al 20% di batteria, si prega di caricarlo',
    timeoutType: 'default',
    icon: icon
  })
  notifica.show()
}

/**
 * Mostra una notifica desktop quando il camino viene rilevato come spento
 * dall'agente AI. La notifica avvisa l'utente di riaccendere il camino.
 */
function mostraNotificaCaminoSpento() {
  let iconPath: string
  iconPath = is.dev 
  ? join(__dirname, '../../build/icon.png')
  : join(process.resourcesPath, 'build/icon.png')
  const icon = nativeImage.createFromPath(iconPath) 
  
  const notifica = new Notification({
    title: 'Camino spento',
    body: 'Il camino è spento, vai a riaccenderlo!',
    timeoutType: 'default',
    icon: icon
  })
  notifica.show()
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.camino.monitoraggio')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Listener per lo scatto foto via SSH
  ipcMain.on('avvia-scatto', () => {
    scattaFotoSSH()
  })

  ipcMain.on('collega-dispositivo', () => {
    collegaDispositivoSSH()
  })

  ipcMain.on('scollega-dispositivo', () => {
    scollegaDispositivoSSH()
  })

  ipcMain.on('mostra-notifica-telefono-scarico', () => {
    mostraNotificaTelefonoScarico()
  })

  ipcMain.on('mostra-notifica-camino-spento', () => {
    mostraNotificaCaminoSpento()
  })
  ipcMain.on('check-python-running', () => {
    checkPythonRunning()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
