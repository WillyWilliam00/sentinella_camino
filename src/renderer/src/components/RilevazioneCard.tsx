import { AlertCircle, Clock, Flame, HourglassIcon, Loader2, X } from "lucide-react";
import type { Rilevazione } from "./Dashboard";
import { useEffect, useState } from "react";
import useTempoNuovaRilevazione from "@renderer/hooks/useTempoNuovaRilevazione";


interface RilevazioneCardProps {
    rilevazione: Rilevazione | null; 
    isLoading: boolean;
    onClose: () => void;
}

export default function RilevazioneCard({ rilevazione, isLoading, onClose }: RilevazioneCardProps) {
    
    

   

    if (rilevazione && rilevazione.url_foto && !isLoading) {
        return (
            <div className="flex-col gap-2 rounded-xl bg-orange-900/30 backdrop-blur-sm relative shadow-lg shadow-amber-900/10 border border-orange-800/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20 w-1/3">
                <img
                    src={rilevazione.url_foto}
                    alt="Foto camino"
                    className="h-80 w-full object-cover rounded-t-xl"
                    onError={(e) => {
                        console.error('Errore caricamento immagine:', e);
                    }}
                />
                <div className="flex flex-col gap-2 mt-3 p-4">
                    <p className="text-amber-50 font-medium text-sm">
                        Data: <span className="font-normal text-amber-100/80">{rilevazione.data}</span>
                    </p>
                    <p className="text-amber-50 font-medium text-sm">
                        Stato: <span className="font-normal text-amber-100/80">{rilevazione.stato}</span>
                    </p>
                    {rilevazione.stato === "ACCESO" ? (
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
                
                <button 
                    className="absolute top-3 right-3 bg-orange-900/70 backdrop-blur-sm p-1.5 rounded-full hover:bg-orange-800/80 transition-all duration-300 cursor-pointer border border-orange-700/50 shadow-md" 
                    onClick={onClose}
                >
                    <X className="w-4 h-4 text-amber-50" />
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-1/3 h-56 bg-orange-900/30 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 border border-orange-800/30 shadow-lg">
                <p className="text-amber-200/70 font-medium text-center px-4 text-sm">Il nostro agente AI sta analizzando la foto...</p>
                <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-1/3 h-80 bg-orange-900/30 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 border border-orange-800/30 shadow-lg">
            <p className="text-amber-200/70 font-medium text-center px-4 text-sm">Nessuna immagine disponibile</p>
            <AlertCircle className="w-10 h-10 text-orange-500/60" />
        </div>
    );
}

