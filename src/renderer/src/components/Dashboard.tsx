import { useState } from "react";
import DispositivoInfo from "./DispositivoInfo";
import { AlertCircle, Flame, Loader2, X } from "lucide-react";
import useRilevazioniRealtime from "@renderer/hooks/useRilevazioniRealtime";

export interface Rilevazione {
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
    const [rilevazioniLoading, setRilevazioniLoading] = useState<boolean>(false);

    

    // Sottoscrizione solo ai canali necessari: rilevazione e test_foto
    useRilevazioniRealtime(
        [
            { channelName: 'rilevazione', eventName: 'nuova_rilevazione' },
            { channelName: 'rilevazione_loading', eventName: 'nuova_rilevazione_loading' }
        ],
        (event: RilevazioneEvent) => {
            if (event.event === 'nuova_rilevazione') {
                rilevazioni && setRilevazioni(null) 
                const rilevazione = (event as RilevazioneEvent).payload;
                const optionDate: Intl.DateTimeFormatOptions = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }
                const normalData = new Date(rilevazione.data).toLocaleString('it-IT', optionDate);
                const newObj = {
                    ...rilevazione,
                    data: normalData
                }
                setRilevazioni(newObj);
                setRilevazioniLoading(false);
            }
            if (event.event === 'nuova_rilevazione_loading') {
                setRilevazioniLoading(true);
            }
        }
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-semibold text-amber-50 flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    Dashboard
                </h1>
                <p className="text-amber-100/70 font-medium text-sm">Monitorando lo stato del tuo camino...</p>
            </div>
            <div className="bg-orange-950/50  rounded-xl shadow-xl shadow-amber-900/20 p-4 border border-orange-800/50 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold text-amber-50">Notifica di rilevamento</h2>
                </div>
                <div className="flex lg:flex-col  items-center gap-4 justify-between">
                    {rilevazioni && rilevazioni.url_foto && !rilevazioniLoading ? (
                        <div className="flex-col gap-2 rounded-xl bg-orange-900/30 backdrop-blur-sm relative shadow-lg shadow-amber-900/10 border border-orange-800/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20 w-1/3">
                            <img
                                src={rilevazioni.url_foto}
                                alt="Foto camino"
                                className="h-80 w-full  object-cover rounded-t-xl"
                                onError={(e) => {
                                    console.error('Errore caricamento immagine:', e);
                                }}
                            />
                            <div className="flex flex-col gap-2 mt-3 p-4">
                                <p className="text-amber-50 font-medium text-sm">Data: <span className="font-normal text-amber-100/80">{rilevazioni.data}</span></p>
                                <p className="text-amber-50 font-medium text-sm">Stato: <span className="font-normal text-amber-100/80">{rilevazioni.stato}</span></p>
                                {rilevazioni.stato === "ACCESO" ? (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/20 border border-green-500/30 mt-1">
                                        <p className="text-green-400 font-medium text-sm">Il camino è acceso</p>
                                        <Flame className="w-4 h-4 text-green-400" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 mt-1">
                                        <p className="text-orange-400 font-medium text-sm">ATTENZIONE: Il camino si sta spegnendo!</p>
                                        <Flame className="w-4 h-4 text-orange-400" />
                                    </div>
                                )}
                            </div>
                            <button className="absolute top-3 right-3 bg-orange-900/70 backdrop-blur-sm p-1.5 rounded-full hover:bg-orange-800/80 transition-all duration-300 cursor-pointer border border-orange-700/50 shadow-md" onClick={() => setRilevazioni(null)}>
                                <X className="w-4 h-4 text-amber-50" />
                            </button>
                        </div>
                    ) : rilevazioniLoading ? (
                        <div className="w-1/3 h-56 bg-orange-900/30 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 border border-orange-800/30 shadow-lg">
                            <p className="text-amber-200/70 font-medium text-center px-4 text-sm">Il nostro agente AI sta analizzando la foto...</p>
                            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="w-1/3 h-80 bg-orange-900/30 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 border border-orange-800/30 shadow-lg">
                            <p className="text-amber-200/70 font-medium text-center px-4 text-sm">Nessuna immagine disponibile</p>
                            <AlertCircle className="w-10 h-10 text-orange-500/60" />
                        </div>
                    )}
                    <DispositivoInfo setRilevazioni={setRilevazioni} />
                </div>
            </div>
        </div>
    )
}