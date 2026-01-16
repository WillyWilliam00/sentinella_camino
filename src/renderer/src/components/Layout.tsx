import { Outlet } from "react-router";
import { Camera, Flame, Loader2, X } from "lucide-react";
import { useState } from "react";
import useRilevazioniRealtime from "@renderer/hooks/useRilevazioniRealtime";

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
        <div className="w-full h-screen bg-linear-to-b from-black to-amber-800">
            <header className="flex justify-center items-center h-16 bg-amber-800 w-1/2 rounded-full shadow-lg shadow-amber-800/50 fixed top-4 right-1/2 translate-x-1/2 z-10">
                <div className="flex items-center gap-2 justify-between px-6 w-full">
                    <div className="flex items-center gap-2">
                        <Flame className="w-6 h-6 text-white" />
                        <h1 className="font-bold text-white">Sentinella Camino</h1>
                    </div>


                    <button className="bg-stone-800 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer" onMouseEnter={() => setTooltip(true)} onMouseLeave={() => setTooltip(false)} onClick={() => setFotoManualeLoading(true)}>

                        <Camera className="w-4 h-4" />
                    </button>

                    <div className={`${!tooltip ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300 absolute top-13 right-4 bg-stone-800 text-white px-4 py-2 rounded-md`}>
                        Fai una foto di prova
                    </div>




                </div>
            </header>
            <main className="pt-24 px-8 pb-4">
                <Outlet />


                {(fotoManuale || fotoManualeLoading) && <div className="flex justify-center items-center bg-stone-800/50 fixed inset-0 z-50">

                    <div className="bg-stone-500 rounded-lg p-4 border border-stone-700 w-1/2 h-1/2 relative">

                        <div className="flex justify-center items-center h-full w-full">
                            {
                                fotoManualeLoading && !fotoManuale ? <div className="flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-20 h-20 text-white animate-spin" />
                                    <p className="text-white text-center text-xl font-semibold">il tuo dispositivo sta facendo la foto...</p>
                                </div> : <img src={fotoManuale || ''} alt="Foto di prova" className="w-full h-full object-contain rounded-lg" />
                            }
                        </div>
                        <X className="w-4 h-4 text-white cursor-pointer absolute top-4 right-4" onClick={() => { setFotoManuale(null); setFotoManualeLoading(false); }} />
                    </div>

                </div>}
            </main>
            <footer></footer>
        </div>
    )
}