"use client";

import { useEffect, useState, useRef } from "react";

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  angle: number;
  thickness: number;
}

function generateMeteors(count: number): Meteor[] {
  const meteors: Meteor[] = [];
  for (let i = 0; i < count; i++) {
    meteors.push({
      x: Math.random() * 150 - 25, // Start off-screen sometimes
      y: Math.random() * -50, // Start above screen
      length: Math.random() * 80 + 40, // 40-120px length
      speed: Math.random() * 0.3 + 0.15, // Very slow speed
      opacity: Math.random() * 0.4 + 0.1, // 0.1-0.5 opacity
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 degrees with slight variation
      thickness: Math.random() * 1.5 + 0.5, // 0.5-2px thin
    });
  }
  return meteors;
}

export default function ParticlesBackground() {
  const [isDark, setIsDark] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isDark) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize meteors
    if (meteorsRef.current.length === 0) {
      meteorsRef.current = generateMeteors(15); // Fewer meteors for elegance
    }

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      meteorsRef.current.forEach((meteor) => {
        // Update position - diagonal movement
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;

        // Reset meteor when it goes off screen
        if (meteor.y > 110 || meteor.x > 110) {
          meteor.x = Math.random() * 100 - 20;
          meteor.y = Math.random() * -30 - 10;
          meteor.opacity = Math.random() * 0.4 + 0.1;
        }

        // Calculate actual pixel positions
        const x = (meteor.x / 100) * canvas.width;
        const y = (meteor.y / 100) * canvas.height;
        
        // Calculate end point of meteor trail
        const endX = x - Math.cos(meteor.angle) * meteor.length;
        const endY = y - Math.sin(meteor.angle) * meteor.length;

        // Draw meteor with gradient trail
        const gradient = ctx.createLinearGradient(x, y, endX, endY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
        gradient.addColorStop(0.3, `rgba(255, 255, 255, ${meteor.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = meteor.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Add a small glow at the head
        ctx.beginPath();
        ctx.arc(x, y, meteor.thickness + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity * 0.8})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isDark]);

  if (!isDark) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ background: "transparent" }}
    />
  );
}
