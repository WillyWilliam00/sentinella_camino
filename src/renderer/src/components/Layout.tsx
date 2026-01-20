import { Outlet } from "react-router";
import { Camera, Flame } from "lucide-react";
import { useState } from "react";
import useRilevazioniRealtime from "@renderer/hooks/useRilevazioniRealtime";
import FotoModal from "./FotoModal";
interface FotoEvent {
    event: string;
    payload: { valore: string };
    type: string;
}

export default function Layout() {
    const [tooltip, setTooltip] = useState(false);
    const [fotoManuale, setFotoManuale] = useState<FotoEvent["payload"]["valore"] | null>(null);
    const [fotoManualeLoading, setFotoManualeLoading] = useState(false);
 

    const handleFotoEvent = (payload: FotoEvent) => {
        setFotoManualeLoading(false);
        if (payload.event === "foto") {
            setFotoManuale(payload.payload.valore);
        }
    }



  


    useRilevazioniRealtime([{ channelName: "test_foto", eventName: "foto" }], handleFotoEvent);
    return (
        <div className="w-full min-h-screen  bg-linear-to-b from-black via-orange-950 to-amber-900">
            <header className="flex justify-center items-center h-16 bg-linear-to-r from-orange-900 to-amber-900 w-1/2 rounded-full shadow-xl shadow-amber-900/40 fixed top-4 right-1/2 translate-x-1/2 z-10 backdrop-blur-sm border border-orange-800/30">
                <div className="flex items-center gap-3 justify-between px-8 w-full">
                    <div className="flex items-center gap-3">
                        <Flame className="w-7 h-7 text-amber-50" />
                        <h1 className="font-semibold text-amber-50 text-lg">Monitoraggio Camino</h1>
                       
                    </div>
                    

                    <button 
                        className="bg-orange-900/80 hover:bg-orange-800 text-amber-50 px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-900/30 border border-orange-800/50" 
                        onMouseEnter={() => setTooltip(true)} 
                        onMouseLeave={() => setTooltip(false)} 
                        onClick={() => {
                            setFotoManualeLoading(true)
                            window.electronAPI.mandaOrdineScatto()
                        }}
                    >
                        <Camera className="w-5 h-5" />
                    </button>

                    <div className={`${!tooltip ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300 absolute top-16 right-4 bg-orange-900/90 backdrop-blur-sm text-amber-50 px-4 py-2 rounded-lg shadow-lg border border-orange-800/50`}>
                        Fai una foto di prova
                    </div>
                </div>
            </header>
            <main className="pt-28 px-10 pb-6">
                <Outlet />

                <FotoModal
                    foto={fotoManuale}
                    isLoading={fotoManualeLoading}
                    onClose={() => {
                        setFotoManuale(null);
                        setFotoManualeLoading(false);
                    }}
                />
             
            </main>
            <footer></footer>
        </div>
    )
}