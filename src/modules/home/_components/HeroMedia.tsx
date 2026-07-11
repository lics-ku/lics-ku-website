"use client";

import { useEffect, useRef } from "react";

/**
 * HeroMedia — the hero's background slot.
 *
 * Default: a generative "signal field" — a node graph with wave pulses that
 * propagate outward from random nodes, lighting up links as the wavefront
 * passes. It's a literal nod to the lab's work: message-passing, wireless
 * propagation, distributed cooperation over networks.
 *
 * To drop in real footage later, pass `videoSrc` (e.g. "/hero.webm"); the canvas
 * is skipped and a muted, looping <video> takes its place. Nothing else changes.
 */
export function HeroMedia({ videoSrc }: { videoSrc?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    type Node = { x: number; y: number; vx: number; vy: number };
    type Pulse = { x: number; y: number; r: number; born: number };

    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    const SPEED = 0.09; // wavefront px/ms
    const LINK_DIST = 170;

    // Theme-aware colours, re-read when the .dark class flips.
    let inkRGB = "20, 18, 16";
    let crimsonRGB = "142, 31, 46";
    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      const ink = styles.getPropertyValue("--hero-ink-rgb").trim();
      const cr = styles.getPropertyValue("--hero-crimson-rgb").trim();
      if (ink) inkRGB = ink;
      if (cr) crimsonRGB = cr;
    };

    const seed = () => {
      const area = width * height;
      const count = Math.min(64, Math.max(22, Math.round(area / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const wavefrontBoost = (x: number, y: number, now: number) => {
      // Returns 0..1 — how close (x,y) is to any active wavefront ring.
      let boost = 0;
      for (const p of pulses) {
        const age = now - p.born;
        const r = age * SPEED;
        const d = Math.hypot(x - p.x, y - p.y);
        const band = Math.abs(d - r);
        if (band < 60) {
          const life = Math.max(0, 1 - r / (Math.max(width, height) * 0.9));
          boost = Math.max(boost, (1 - band / 60) * life);
        }
      }
      return boost;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // Move nodes gently.
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      // Links.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_DIST) continue;
          const base = (1 - d / LINK_DIST) * 0.16;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const boost = reduce ? 0 : wavefrontBoost(mx, my, now);
          ctx.strokeStyle = boost > 0.02
            ? `rgba(${crimsonRGB}, ${(base + boost * 0.7).toFixed(3)})`
            : `rgba(${inkRGB}, ${base.toFixed(3)})`;
          ctx.lineWidth = boost > 0.3 ? 1.1 : 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Nodes.
      for (const n of nodes) {
        const boost = reduce ? 0 : wavefrontBoost(n.x, n.y, now);
        const rad = 1.5 + boost * 2.4;
        ctx.beginPath();
        ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
        ctx.fillStyle =
          boost > 0.15
            ? `rgba(${crimsonRGB}, ${(0.4 + boost * 0.55).toFixed(3)})`
            : `rgba(${inkRGB}, 0.28)`;
        ctx.fill();
      }

      // Retire finished pulses.
      pulses = pulses.filter(
        (p) => (now - p.born) * SPEED < Math.max(width, height) * 0.95
      );
    };

    readColors();
    resize();

    if (reduce) {
      // Single static frame — no loop, no wave animation.
      draw(0);
      return;
    }

    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let nextPulse = 600;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) {
        last = t;
        return;
      }
      const dt = last ? t - last : 16;
      last = t;
      elapsed += dt;

      nextPulse -= dt;
      if (nextPulse <= 0 && nodes.length) {
        const origin = nodes[Math.floor(Math.random() * nodes.length)];
        pulses.push({ x: origin.x, y: origin.y, r: 0, born: elapsed });
        nextPulse = 2200 + Math.random() * 2200;
      }
      draw(elapsed);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    const observer = new MutationObserver(readColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [videoSrc]);

  if (videoSrc) {
    return (
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="h-full w-full object-cover"
      />
    );
  }

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}
