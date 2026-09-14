import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

type ScratchRevealProps = {
  coverUrl: string;
  revealUrl: string;
  alt: string;
  language: "ka" | "en";
};

export function ScratchReveal({ coverUrl, revealUrl, alt, language }: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const distanceRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  const drawCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      canvas.width = image.naturalWidth || 900;
      canvas.height = image.naturalHeight || 1100;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      distanceRef.current = 0;
      lastPointRef.current = null;
      setProgress(0);
      setReady(true);
    };
    image.src = coverUrl;
  };

  useEffect(() => { setReady(false); drawCover(); }, [coverUrl]);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * (canvas.width / bounds.width), y: (event.clientY - bounds.top) * (canvas.height / bounds.height) };
  };

  const scratch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!ready || (event.pointerType !== "mouse" && !drawingRef.current)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const point = pointFromEvent(event);
    const previous = lastPointRef.current ?? point;
    const brush = Math.max(42, canvas.width * 0.085);
    context.globalCompositeOperation = "destination-out";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = brush;
    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
    distanceRef.current += distance + (lastPointRef.current ? 0 : brush * 0.35);
    const threshold = canvas.width * 4.2;
    const nextProgress = Math.min(100, Math.round((distanceRef.current / threshold) * 100));
    setProgress(nextProgress);
    lastPointRef.current = point;
    if (nextProgress >= 82) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setProgress(100);
    }
  };

  return <div className={`scratch-reveal ${progress === 100 ? "complete" : ""}`}>
    <img className="scratch-reveal-image" src={revealUrl} alt={alt} />
    <canvas
      ref={canvasRef}
      aria-label={language === "ka" ? "ვირტუალური გადასაფხეკი ზედაპირი" : "Interactive scratch-off surface"}
      onPointerDown={(event) => { drawingRef.current = true; event.currentTarget.setPointerCapture(event.pointerId); lastPointRef.current = null; scratch(event); }}
      onPointerMove={scratch}
      onPointerUp={() => { drawingRef.current = false; lastPointRef.current = null; }}
      onPointerLeave={() => { drawingRef.current = false; lastPointRef.current = null; }}
    />
    <div className="scratch-instruction"><Sparkles size={14} /><span>{language === "ka" ? "გაატარე კურსორი ან თითი და გადაფხიკე" : "Hover or drag to scratch and reveal"}</span><b>{progress}%</b></div>
    {progress > 0 && <button className="scratch-reset" type="button" onClick={drawCover} aria-label={language === "ka" ? "თავიდან დაწყება" : "Reset scratch effect"}><RotateCcw size={14} /></button>}
  </div>;
}
