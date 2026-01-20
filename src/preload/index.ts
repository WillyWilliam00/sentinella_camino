import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      mandaOrdineScatto: () => ipcRenderer.send('avvia-scatto'),
      mandaCollegaDispositivo: () => ipcRenderer.send('collega-dispositivo'),
      mandaScollegaDispositivo: () => ipcRenderer.send('scollega-dispositivo'),
      mostraNotificaTelefonoScarico: () => ipcRenderer.send('mostra-notifica-telefono-scarico'),
      mostraNotificaCaminoSpento: () => ipcRenderer.send('mostra-notifica-camino-spento'),
      checkPythonRunning: () => ipcRenderer.send('check-python-running'),
      onPythonStatus: (callback) => {
        const listener = (_event, value) => callback(value)
        ipcRenderer.on('python-running', listener)
        return () => ipcRenderer.removeListener('python-running', listener)
      }
  });

  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
