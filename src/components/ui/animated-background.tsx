"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "dots" | "grid" | "gradient" | "particles";
}

export function AnimatedBackground({
  children,
  className,
  variant = "gradient",
}: AnimatedBackgroundProps) {
  const getBackgroundPattern = () => {
    switch (variant) {
      case "dots":
        return "radial-gradient(circle, hsl(var(--border)/20) 1px, transparent 1px)";
      case "grid":
        return `
          linear-gradient(hsl(var(--border)/10) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--border)/10) 1px, transparent 1px)
        `;
      case "particles":
        return "radial-gradient(circle at 25% 25%, hsl(var(--primary)/10) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(var(--secondary)/10) 0%, transparent 50%)";
      default:
        return "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)/20) 50%, hsl(var(--background)) 100%)";
    }
  };

  const getBackgroundSize = () => {
    switch (variant) {
      case "dots":
        return "20px 20px";
      case "grid":
        return "20px 20px, 20px 20px";
      case "particles":
        return "400px 400px, 400px 400px";
      default:
        return "100% 100%";
    }
  };

  return (
    <div
      className={cn(
        "relative min-h-screen",
        className,
      )}
      style={{
        backgroundImage: getBackgroundPattern(),
        backgroundSize: getBackgroundSize(),
        backgroundPosition: variant === "particles" ? "0% 0%, 100% 100%" : "0 0",
        backgroundRepeat: variant === "gradient" ? "no-repeat" : "repeat",
      }}
    >
      {/* Animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
  ease?: number;
  color?: string;
  refresh?: boolean;
}

export function Particles({
  className,
  quantity = 30,
  ease = 50,
  color = "hsl(var(--primary))",
  refresh = false,
}: ParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const context = React.useRef<CanvasRenderingContext2D | null>(null);
  const circles = React.useRef<any[]>([]);
  const animationFrame = React.useRef<number>();
  const mouse = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const initCanvas = React.useCallback(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return;

    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    context.current = ctx;

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    circles.current = Array.from({ length: quantity }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      translateX: 0,
      translateY: 0,
      size: Math.random() * 2 + 0.1,
      alpha: Math.random() * 0.5 + 0.1,
      targetAlpha: Math.random() * 0.5 + 0.1,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      magnetism: 0.1 + Math.random() * 4,
    }));
  }, [quantity]);

  const animate = React.useCallback(() => {
    if (!context.current || !canvasRef.current) return;

    const ctx = context.current;
    const canvas = canvasRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.current.forEach((circle: any, i: number) => {
      // Update position
      circle.x += circle.dx;
      circle.y += circle.dy;

      // Boundary check
      if (circle.x < 0 || circle.x > canvas.width) circle.dx = -circle.dx;
      if (circle.y < 0 || circle.y > canvas.height) circle.dy = -circle.dy;

      // Mouse interaction
      const distance = Math.sqrt(
        (mouse.current.x - circle.x) ** 2 + (mouse.current.y - circle.y) ** 2,
      );

      if (distance < 100) {
        circle.alpha = Math.min(circle.alpha + 0.02, 0.8);
        const force = (100 - distance) / 100;
        circle.x += (mouse.current.x - circle.x) * force * 0.01;
        circle.y += (mouse.current.y - circle.y) * force * 0.01;
      } else {
        circle.alpha = Math.max(circle.alpha - 0.02, circle.targetAlpha);
      }

      // Draw circle
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(")", `, ${circle.alpha})`).replace("hsl", "hsla");
      ctx.fill();
    });

    animationFrame.current = requestAnimationFrame(animate);
  }, [color, ease]);

  React.useEffect(() => {
    initCanvas();
    animate();

    const handleResize = () => {
      initCanvas();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [initCanvas, animate]);

  React.useEffect(() => {
    if (refresh) {
      initCanvas();
    }
  }, [refresh, initCanvas]);

  return (
    <div ref={canvasContainerRef} className={cn("absolute inset-0", className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
      />
    </div>
  );
}

interface RetroGridProps {
  className?: string;
  angle?: number;
}

export function RetroGrid({ className, angle = 65 }: RetroGridProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-50 [perspective:200px]",
        className,
      )}
      style={{ "--grid-angle": `${angle}deg` } as React.CSSProperties}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            "animate-grid",
            "h-[300vh] w-[300vw] -translate-x-1/2 -translate-y-1/2",
            "[background-image:linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_0)]",
            "[background-size:100px_100px]",
            "[transform-origin:100%_100%_0]",
          )}
        />
      </div>
    </div>
  );
}
