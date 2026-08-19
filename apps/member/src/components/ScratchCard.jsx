import { useEffect, useRef, useState } from 'react';

/**
 * A scratch card that actually scratches.
 *
 * The prize is drawn underneath in ordinary markup; a canvas sits over it and
 * is erased where a finger goes. Once enough has been cleared the rest wipes
 * itself — nobody should have to scrub a card they have plainly won, and the
 * threshold is what stops a half-scratched card looking broken.
 *
 * Nothing here decides the prize. What a card is worth is programme
 * configuration, and this is a concept screen: the prize is handed in.
 */
export default function ScratchCard({ prize, onRevealed }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return undefined;

    // Backing store at device resolution, so the scratched edge is not blocky.
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    const foil = ctx.createLinearGradient(0, 0, width, height);
    foil.addColorStop(0, '#c9ced6');
    foil.addColorStop(0.5, '#e7ebf0');
    foil.addColorStop(1, '#b9c0ca');
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(90,99,112,0.55)';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch here', width / 2, height / 2 + 4);

    return undefined;
  }, [revealed]);

  /** Proportion of the cover already cleared. Sampled, not counted pixel by pixel. */
  function clearedFraction(ctx, canvas) {
    const step = 16;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * step) {
      total += 1;
      if (data[i] === 0) clear += 1;
    }
    return total ? clear / total : 0;
  }

  function scratch(event) {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const rect = canvas.getBoundingClientRect();
    const point = event.touches?.[0] ?? event;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    if (clearedFraction(ctx, canvas) > 0.45) {
      setRevealed(true);
      onRevealed?.(prize);
    }
  }

  return (
    <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gold-500 to-brand-500">
      <div className="flex h-full flex-col items-center justify-center px-3 text-center text-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
          You won
        </p>
        <p className="mt-0.5 text-[15px] font-extrabold leading-tight">{prize}</p>
      </div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-pointer touch-none"
          onPointerDown={(e) => {
            drawing.current = true;
            scratch(e);
          }}
          onPointerMove={(e) => drawing.current && scratch(e)}
          onPointerUp={() => {
            drawing.current = false;
          }}
          onPointerLeave={() => {
            drawing.current = false;
          }}
        />
      )}
    </div>
  );
}
