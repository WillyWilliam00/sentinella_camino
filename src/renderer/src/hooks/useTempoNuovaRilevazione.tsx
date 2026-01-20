import { useEffect, useState } from "react";

export default function useTempoNuovaRilevazione(timestampOriginale: string) {
const attesaProssimaRilevazione = 1800; // 30 minuti
const [minutiRimanenti, setMinutiRimanenti] = useState<number>(30);
const [secondiRimanenti, setSecondiRimanenti] = useState<number>(0);

useEffect(() => {
    if(!timestampOriginale || timestampOriginale.trim() === "") return;
    const calcolaTempoRimanente = () => {
        const timeStampOriginale = new Date(timestampOriginale).getTime();
        const ora = Date.now()
        const tempoPassato = Math.floor((ora - timeStampOriginale)/1000)
        const tempoRimanente = Math.max(0, attesaProssimaRilevazione - tempoPassato)
        const minutiRimanenti = Math.floor(tempoRimanente / 60)
        const secondiRimanenti = tempoRimanente % 60
        setMinutiRimanenti(minutiRimanenti)
        setSecondiRimanenti(secondiRimanenti)
    }
    calcolaTempoRimanente()
    const interval = setInterval(calcolaTempoRimanente, 1000)
    return () => clearInterval(interval)
    
}, [timestampOriginale])

return {minutiRimanenti, secondiRimanenti}



}

