import { useState } from "react";
import DispositivoInfo from "./DispositivoInfo";
import { Flame } from "lucide-react";
import useRilevazioniRealtime from "@renderer/hooks/useRilevazioniRealtime";
import RilevazioneCard from "./RilevazioneCard";

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
                if(newObj.stato === "SPENTO") {
                    console.log("Mostra notifica camino spento");
                    window.electronAPI.mostraNotificaCaminoSpento();
                }
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
                <div className="flex xl:flex-col  items-center gap-4 justify-between">
                    <RilevazioneCard
                        rilevazione={rilevazioni}
                        isLoading={rilevazioniLoading}
                        onClose={() => setRilevazioni(null)}
                    />
                    <DispositivoInfo setRilevazioni={setRilevazioni} />
                </div>
            </div>
        </div>
    )
}