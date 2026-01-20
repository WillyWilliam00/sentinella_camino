import { Loader2, X } from "lucide-react";

interface FotoModalProps {
    foto: string | null;
    isLoading: boolean;
    onClose: () => void;
    messaggioLoading?: string;
    altText?: string;
}

export default function FotoModal({ 
    foto, 
    isLoading, 
    onClose, 
    messaggioLoading = "il tuo dispositivo sta facendo la foto...",
    altText = "Foto di prova"
}: FotoModalProps) {
    if (!foto && !isLoading) return null;

    return (
        <div className="flex justify-center items-center bg-black/70 backdrop-blur-sm fixed inset-0 z-50">
            <div className="bg-orange-950/95 backdrop-blur-md rounded-xl p-6 border border-orange-800/50 w-1/2 h-1/2 relative shadow-2xl shadow-amber-900/30">
                <div className="flex justify-center items-center h-full w-full">
                    {isLoading && !foto ? (
                        <div className="flex flex-col items-center justify-center gap-6">
                            <Loader2 className="w-20 h-20 text-orange-400 animate-spin" />
                            <p className="text-amber-50 text-center text-xl font-medium">{messaggioLoading}</p>
                        </div>
                    ) : (
                        <img src={foto || ''} alt={altText} className="w-full h-full object-contain rounded-lg" />
                    )}
                </div>
                <button 
                    className="absolute top-4 right-4 bg-orange-900/70 backdrop-blur-sm p-2.5 rounded-full hover:bg-orange-800/80 transition-all duration-300 cursor-pointer border border-orange-700/50 shadow-md hover:shadow-lg" 
                    onClick={onClose}
                >
                    <X className="w-5 h-5 text-amber-50" />
                </button>
            </div>
        </div>
    );
}

