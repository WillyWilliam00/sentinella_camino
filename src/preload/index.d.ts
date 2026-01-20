import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: {
      mandaOrdineScatto: () => void
      mandaCollegaDispositivo: () => void
      mandaScollegaDispositivo: () => void
      mostraNotificaTelefonoScarico: () => void
      mostraNotificaCaminoSpento: () => void
      checkPythonRunning: () => void
      onPythonStatus: (callback: (value: boolean) => void) => () => void
    }
  }
}
