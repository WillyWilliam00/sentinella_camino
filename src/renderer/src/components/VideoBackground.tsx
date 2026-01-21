
type VideoBackgroundProps = {
  /** Path assoluto lato Vite (es. "/fire.mp4") oppure URL. */
  src: string;
  /** Immagine mostrata mentre il video carica (opzionale). */
  poster?: string;
  /** Opacità del video (0-100) */
  videoOpacityClassName?: string;
  /** Overlay (gradiente/scuro) sopra il video per leggibilità. */
  overlayClassName?: string;
};

export default function VideoBackground({
  src,
  poster,
  videoOpacityClassName = "opacity-90",
  overlayClassName = "bg-linear-to-b from-black via-orange-950 to-amber-900 opacity-70",
}: VideoBackgroundProps) {
 

  return (
    <>

        <video
          className={`fixed inset-0 h-full w-full object-cover pointer-events-none -z-20 ${videoOpacityClassName}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={poster}
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
        </video>
      

      {/* Overlay: dà coerenza col tema e mantiene contrasto del testo sopra al video */}
      <div className={`fixed inset-0 pointer-events-none -z-10 ${overlayClassName}`} aria-hidden="true" />
    </>
  );
}


