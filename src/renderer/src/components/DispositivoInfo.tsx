import useRilevazioniRealtime from "@renderer/hooks/useRilevazioniRealtime";
import { Battery, PowerOff, Smartphone, Zap } from "lucide-react";
import { useState } from "react";

interface EventPercentuale {
    event: string;
    payload: {
        percentuale: number;
        stato: string;
        timestamp: string;
        temperatura_batteria: number;
        rssi: number;
        link_speed_mbps: number;
    };
}



export default function DispositivoInfo() {
    const [infoTelefono, setInfoTelefono] = useState<EventPercentuale["payload"]>({
        percentuale: 0,
        stato: "",
        timestamp: "",
        temperatura_batteria: 0,
        rssi: 0,
        link_speed_mbps: 0
    });
    
    // Sottoscrizione solo al canale necessario: monitoraggio_telefono
    useRilevazioniRealtime(
        [{ channelName: 'monitoraggio_telefono', eventName: 'info' }],
        (event: EventPercentuale) => {
            if (event.event === 'info') {
                setInfoTelefono(event.payload);
            }
        }
    );
    return (
        <div className="rounded-lg shadow-lg p-4 bg-stone-800 border border-stone-700 w-1/3 ">
            <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6 text-amber-800" />
                <h1 className="text-xl font-bold text-white">Informazioni del dispositivo</h1>
            </div>
            <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">Modello:</p>
                    <p className="text-white">P20 Pro</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">Temperatura batteria:</p>
                    <p className="text-white">{infoTelefono?.temperatura_batteria}°C</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">RSSI:</p>
                    <p className="text-white">{infoTelefono?.rssi}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">Velocità di connessione:</p>
                    <p className="text-white">{infoTelefono?.link_speed_mbps} Mbps</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">Stato batteria:</p>
                    <p className="text-white">{infoTelefono?.stato}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">Sistema Operativo:</p>
                    <p className="text-white">Android 13</p>
                </div>
                <div className="flex items-center justify-between gap-2 px-4">
                    <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-amber-800" />
                        <p className="text-white">Batteria rimanente</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-800 animate-pulse" />
                        <p className="text-white">{infoTelefono?.percentuale}%</p>
                    </div>
                </div>
                <div className="px-4">
                    <div className="relative w-full h-2 bg-gray-500 rounded-full">
                        <div className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${infoTelefono?.percentuale}%` }} />
                    </div>

                </div>
                <div className="flex justify-center">
                    <button className="bg-red-800 text-white px-4 py-2 rounded-md flex items-center gap-2 mt-4">
                        Spegni dispositivo <PowerOff className="w-4 h-4" />
                    </button>
                </div>


            </div>
        </div>
    )
}