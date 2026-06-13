import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface NeuralNetworkVisualizationProps {
  isProcessing?: boolean;
  processingProgress?: number;
}

export default function NeuralNetworkVisualization({
  isProcessing = false,
  processingProgress = 0,
}: NeuralNetworkVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const layers = 20;
    const neuronsPerLayer = 8;
    const layerSpacing = width / (layers + 1);
    const neuronRadius = 4;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = "oklch(0.99 0.001 0)";
      ctx.fillRect(0, 0, width, height);

      // Draw grid background
      ctx.strokeStyle = "oklch(0.9 0.003 0 / 0.1)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw connections and neurons
      for (let layer = 0; layer < layers; layer++) {
        const x = layerSpacing * (layer + 1);

        // Draw connections to next layer
        if (layer < layers - 1) {
          const nextX = layerSpacing * (layer + 2);

          for (let i = 0; i < neuronsPerLayer; i++) {
            const y1 = (height / (neuronsPerLayer + 1)) * (i + 1);

            for (let j = 0; j < neuronsPerLayer; j++) {
              const y2 = (height / (neuronsPerLayer + 1)) * (j + 1);

              // Calculate connection strength based on processing progress
              let alpha = 0.15;
              if (isProcessing) {
                const layerProgress = processingProgress / 100;
                const connectionProgress = layer / layers;
                if (connectionProgress <= layerProgress) {
                  alpha = 0.3 + Math.sin(timeRef.current / 10 + layer + i + j) * 0.2;
                }
              }

              ctx.strokeStyle = `oklch(0.6 0.2 262 / ${alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x, y1);
              ctx.lineTo(nextX, y2);
              ctx.stroke();
            }
          }
        }

        // Draw neurons
        for (let i = 0; i < neuronsPerLayer; i++) {
          const y = (height / (neuronsPerLayer + 1)) * (i + 1);

          // Calculate neuron state
          let neuronColor = "oklch(0.5 0.2 262)";
          let neuronAlpha = 0.6;

          if (isProcessing) {
            const layerProgress = processingProgress / 100;
            const connectionProgress = layer / layers;

            if (connectionProgress <= layerProgress) {
              neuronAlpha = 0.8 + Math.sin(timeRef.current / 5 + layer + i) * 0.2;
              neuronColor = "oklch(0.75 0.15 320)";
            }
          }

          // Draw neuron glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, neuronRadius * 3);
          gradient.addColorStop(0, `oklch(0.75 0.15 320 / ${neuronAlpha * 0.3})`);
          gradient.addColorStop(1, `oklch(0.75 0.15 320 / 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, neuronRadius * 3, 0, Math.PI * 2);
          ctx.fill();

          // Draw neuron core
          ctx.fillStyle = neuronColor;
          ctx.beginPath();
          ctx.arc(x, y, neuronRadius, 0, Math.PI * 2);
          ctx.fill();

          // Draw neuron border
          ctx.strokeStyle = "oklch(0.6 0.2 262)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, neuronRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw layer labels
      ctx.fillStyle = "oklch(0.5 0.01 0)";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      for (let layer = 0; layer < layers; layer += 2) {
        const x = layerSpacing * (layer + 1);
        ctx.fillText(`L${layer + 1}`, x, height - 5);
      }

      // Draw processing progress indicator
      if (isProcessing) {
        const progressX = layerSpacing * (processingProgress / 100 * layers + 1);
        ctx.strokeStyle = "oklch(0.75 0.15 320)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, height);
        ctx.stroke();

        // Draw progress label
        ctx.fillStyle = "oklch(0.75 0.15 320)";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.round(processingProgress)}%`, progressX, 20);
      }

      timeRef.current += 1;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isProcessing, processingProgress]);

  return (
    <Card className="p-6 border-2 border-accent/30">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          تصور الشبكة العصبية (20 طبقة)
        </h3>
        <p className="text-sm text-muted-foreground">
          عرض تفاعلي لبنية الشبكة العصبية وحالة المعالجة
        </p>
      </div>
      <div className="bg-white rounded-lg overflow-hidden border border-border">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: "400px" }}
        />
      </div>
      {isProcessing && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-foreground">حالة المعالجة</span>
            <span className="text-accent font-mono">{Math.round(processingProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-secondary transition-all"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
