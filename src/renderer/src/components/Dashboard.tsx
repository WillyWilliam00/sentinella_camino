import { useState } from "react";
import DispositivoInfo from "./DispositivoInfo";
import { Flame, X } from "lucide-react";
import useRilevazioniRealtime from "@renderer/hooks/useRilevazioniRealtime";

interface Rilevazione {
    id: string;
    data: string;
    stato: "ACCESO" | "SPENTO";
    url_foto: string;
}
interface RilevazioneEvent {
    event: string;
    payload: Rilevazione;
    type: string;
}
export default function Dashboard() {
    const [rilevazioni, setRilevazioni] = useState<Rilevazione | null>(null);

    // Sottoscrizione solo ai canali necessari: rilevazione e test_foto
    useRilevazioniRealtime(
        [
            { channelName: 'rilevazione', eventName: 'nuova_rilevazione' }
        ],
        (event: RilevazioneEvent) => {
            if (event.event === 'nuova_rilevazione') {
                const rilevazione = (event as RilevazioneEvent).payload;
                setRilevazioni(rilevazione);
            }
        }
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-white">🔥 Dashboard</h1>
                <p className="text-gray-200">Monitorando lo stato del tuo camino...</p>
            </div>
            <div className="bg-stone-800 rounded-lg shadow-lg p-4 border border-stone-700">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">Notifica di rilevamento:</h2>
                </div>
                <div className=" flex items-center gap-2 mt-4 justify-between ">
                    {rilevazioni && rilevazioni.url_foto ? (
                        <div className="flex-col gap-2 rounded-lg bg-stone-700  relative">
                            <img
                                src={rilevazioni.url_foto}
                                alt="Foto camino"
                                className="h-96 w-auto object-contain rounded-lg"
                                onError={(e) => {
                                    console.error('Errore caricamento immagine:', e);
                                }}
                            />
                            <div className="flex flex-col gap-2 mt-4 p-4" >
                                <p className="text-white">Data: {rilevazioni.data}</p>
                                <p className="text-white">Stato: {rilevazioni.stato}</p>
                                {rilevazioni.stato === "ACCESO" ? (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10">
                                        <p className="text-green-500">Il camino è acceso </p>
                                        <Flame className="w-4 h-4 text-green-500" />

                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10">
                                        <p className="text-red-500">ATTENZIONE: Il camino si sta spegnendo!</p>
                                        <Flame className="w-4 h-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            <button className="absolute top-4 right-4 bg-stone-800/50 p-2 rounded-full hover:bg-stone-800/80 transition-all duration-300 cursor-pointer" onClick={() => setRilevazioni(null)}>
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-1/3 h-64 bg-stone-700 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">Nessuna immagine disponibile</p>
                        </div>
                    )}
                    <DispositivoInfo />
                </div>


            </div>

        </div>
    )
}