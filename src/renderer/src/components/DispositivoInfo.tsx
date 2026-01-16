import useRilevazioniRealtime from "@renderer/hooks/useRilevazioniRealtime";
import { AlertCircle, Battery, CheckCircle, PowerOff, Smartphone, X, Zap } from "lucide-react";
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
    const [dispositivoOnOff, setDispositivoOnOff] = useState<boolean>(false);

    // Sottoscrizione solo al canale necessario: monitoraggio_telefono
    useRilevazioniRealtime(
        [{ channelName: 'monitoraggio_telefono', eventName: 'info' }],
        (event: EventPercentuale) => {
            if (event.event === 'info') {
                setInfoTelefono(event.payload);
                setDispositivoOnOff(true);
            }
        }
    );
    return (
        <div className="rounded-xl shadow-xl shadow-amber-900/20 p-4 bg-orange-950/50 backdrop-blur-sm border border-orange-800/50 w-1/3 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/30">
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                    <h1 className="text-lg font-semibold text-amber-50">Informazioni del dispositivo</h1>
                </div>
                <div className="flex items-center gap-1.5">
                    <p className={`${dispositivoOnOff ? 'text-green-400' : 'text-red-400'} font-semibold text-xs`}>{dispositivoOnOff ? "Dispositivo connesso" : "Dispositivo non connesso"}</p>
                    {dispositivoOnOff ? <CheckCircle className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {dispositivoOnOff ? (
                    <>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-amber-100/60 font-medium">Modello</p>
                                <p className="text-amber-50 font-semibold text-sm">P20 Pro</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-amber-100/60 font-medium">Sistema Operativo</p>
                                <p className="text-amber-50 font-semibold text-sm">Android 13</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-amber-100/60 font-medium">Temperatura</p>
                                <p className="text-amber-50 font-semibold text-sm">{infoTelefono?.temperatura_batteria}°C</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-amber-100/60 font-medium">RSSI</p>
                                <p className="text-amber-50 font-semibold text-sm">{infoTelefono?.rssi}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-amber-100/60 font-medium">Velocità</p>
                                <p className="text-amber-50 font-semibold text-sm">{infoTelefono?.link_speed_mbps} Mbps</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-amber-100/60 font-medium">Stato batteria</p>
                                <p className="text-amber-50 font-semibold text-sm">{infoTelefono?.stato}</p>
                            </div>
                        </div>
                        <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-800/30">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Battery className="w-4 h-4 text-orange-500" />
                                    <p className="text-amber-50 font-medium text-sm">Batteria rimanente</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
                                    <p className="text-amber-50 font-semibold text-sm">{infoTelefono?.percentuale}%</p>
                                </div>
                            </div>
                            <div className="relative w-full h-2 bg-orange-900/40 rounded-full overflow-hidden">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-linear-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                                    style={{ width: `${infoTelefono?.percentuale}%` }} 
                                />
                            </div>
                        </div>
                        <div className="flex justify-center mt-3">
                            <button className="bg-orange-700 hover:bg-orange-600 text-amber-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-900/30">
                                Spegni dispositivo <PowerOff className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                        <p className="text-amber-50 text-center text-lg font-semibold">Dispositivo non connesso</p>
                        <AlertCircle className="w-10 h-10 text-orange-500/60" />
                    </div>
                )}
            </div>
        </div>
    )
}