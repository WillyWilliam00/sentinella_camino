import { Outlet } from "react-router";
import { Camera, Flame, X } from "lucide-react";
import { useEffect, useState } from "react";
import useRilevazioniRealtime from "@renderer/hooks/useRilevazioniRealtime";
import FotoModal from "./FotoModal";
import VideoBackground from "./VideoBackground";
interface FotoEvent {
    event: string;
    payload: { valore: string };
    type: string;
}

export default function Layout() {
    const [tooltip, setTooltip] = useState(false);
    const [fotoManuale, setFotoManuale] = useState<FotoEvent["payload"]["valore"] | null>(null);
    const [fotoManualeLoading, setFotoManualeLoading] = useState(false);
    const [popupDocker, setPopupDocker] = useState(true);


    const handleFotoEvent = (payload: FotoEvent) => {
        setFotoManualeLoading(false);
        if (payload.event === "foto") {
            setFotoManuale(payload.payload.valore);
        }
    }


   



    useRilevazioniRealtime([{ channelName: "test_foto", eventName: "foto" }], handleFotoEvent);
    return (
        <div className="w-full min-h-screen relative overflow-hidden">
           
            <VideoBackground src="/fire.mp4" />
            <header className="flex justify-center items-center h-12 w-full bg-linear-to-r from-orange-900 to-amber-900  shadow-xl shadow-amber-900/40 fixed  backdrop-blur-sm border border-orange-800/30">
                <div className="flex items-center gap-3 justify-between px-8 w-full">
                    <div className="flex items-center gap-2">
                        <Flame className="w-7 h-7 text-amber-50" />
                        <div className="flex items-end ">
                            <h1 className="font-semibold text-amber-50 text-sm">Sentinella Camino</h1>
                            
                        </div>

                    </div>


                    <button
                        className="bg-gray-800/80 hover:bg-gray-700 text-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-gray-500/30 border border-gray-600/50"
                        onMouseEnter={() => setTooltip(true)}
                        onMouseLeave={() => setTooltip(false)}
                        onClick={() => {
                            setFotoManualeLoading(true)
                            window.electronAPI.mandaOrdineScatto()
                        }}
                    >
                        <Camera className="w-5 h-5" />
                    </button>

                    <div className={`${!tooltip ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300 absolute top-14 right-4 bg-gray-800/90 backdrop-blur-sm text-amber-50 px-4 py-2 rounded-lg shadow-lg border border-gray-600/50`}>
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
                {
                    popupDocker && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center">
                            <X className="w-5 h-5 text-amber-50 absolute top-4 right-4 cursor-pointer" onClick={() => setPopupDocker(false)} />
                            <div className="bg-amber-900/90 rounded-lg p-4 border border-amber-800/50">
                                <h2 className="text-amber-50 text-sm">Ricordati di avviare n8n per il monitoraggio del tuo camino</h2>
                            </div>
                        </div>
                    )
                }

            </main>
            <footer></footer>
        </div>
    )
}