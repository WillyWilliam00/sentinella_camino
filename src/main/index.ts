import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { Client } from 'ssh2'
import dotenv from 'dotenv'

// Carica le variabili d'ambiente dal file .env
dotenv.config()


function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? {  } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

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
