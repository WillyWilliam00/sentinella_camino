import { useEffect, useState } from "react";
type statoPython = 'disconnesso' | 'connesso';
type LoadingMode = 'none' | 'connessione' | 'disconnessione' | 'caricamento';
export default function usePythonIsRunning() {
    const [statoPython, setStatoPython] = useState<statoPython>('disconnesso');
  

    useEffect(() => {
        const handlePythonStatus = (value: boolean) => {
            if (value) {
                console.log('Python in esecuzione');
                setStatoPython('connesso');
            } else {
                console.log('Python non in esecuzione');
                setStatoPython('disconnesso');
            }
        }

        const cleanup = window.electronAPI.onPythonStatus(handlePythonStatus);
        window.electronAPI.checkPythonRunning();
        return () => cleanup();
    }, []);

    


    const refreshEithRetry = ( setLoading: (loading: LoadingMode) => void, string: 'connessione' | 'disconnessione', tentativi = 3, intervallo = 1000) => {
        let count = 0 
        
        window.electronAPI.checkPythonRunning();
        const interval = setInterval(() => {
            count++
            if(string === 'connessione' && statoPython === 'connesso') {
                setLoading('none');
                clearInterval(interval);
                return;
            }
            if(string === 'disconnessione' && statoPython === 'disconnesso') {
                setLoading('none');
                clearInterval(interval);
                return;
            }
            window.electronAPI.checkPythonRunning();
            if(count > tentativi) {
                clearInterval(interval);
                setLoading('none');
            }
        }, intervallo);

        return () => {
            clearInterval(interval);
            setLoading('none');
        }
    }

    return { statoPython, refreshEithRetry };
}
