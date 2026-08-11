"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number };

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Deterministic random values keep the field stable across redraws and tests. */
const createRandom = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = value + Math.imul(value ^ (value >>> 7), 61 | value) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

/**
 * A scroll-driven signal field. Scrolling advances three deterministic
 * wavefronts and pulls the camera back; there is no perpetual animation loop.
 */
export function HeroMedia({ videoSrc }: { videoSrc?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoSrc) return;

    const canvas = canvasRef.current;
    const scene = canvas?.closest<HTMLElement>("[data-hero-scene]");
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !scene) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let progress = 0;
    let scrollStart = 0;
    let scrollRange = 1;
    let frame = 0;
    let inkRGB = "60, 52, 46";
    let crimsonRGB = "142, 31, 46";

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      inkRGB = styles.getPropertyValue("--hero-ink-rgb").trim() || inkRGB;
      crimsonRGB =
        styles.getPropertyValue("--hero-crimson-rgb").trim() || crimsonRGB;
    };

    const seedNodes = () => {
      const random = createRandom(0x1c51013);
      const area = width * height;
      const limit = width < 640 ? 34 : 58;
      const count = Math.min(limit, Math.max(22, Math.round(area / 27000)));
      nodes = Array.from({ length: count }, () => ({
        x: random() * width,
        y: random() * height,
      }));
    };

    const pulseStrength = (x: number, y: number, value: number) => {
      const diagonal = Math.hypot(width, height);
      const origins = [
        nodes[Math.floor(nodes.length * 0.18)],
        nodes[Math.floor(nodes.length * 0.57)],
        nodes[Math.floor(nodes.length * 0.84)],
      ].filter(Boolean);
      let strength = 0;

      origins.forEach((origin, index) => {
        const phase = clamp(value * 1.42 - index * 0.16 + 0.08);
        if (phase <= 0) return;
        const radius = phase * diagonal * 0.7;
        const distance = Math.hypot(x - origin.x, y - origin.y);
        const band = Math.abs(distance - radius);
        const life = 1 - phase * 0.34;
        if (band < 68) {
          strength = Math.max(strength, (1 - band / 68) * life);
        }
      });

      return strength;
    };

    const draw = () => {
      const value = motionQuery.matches ? 0.42 : progress;
      const linkDistance = width < 640 ? 145 : 178;

      context.clearRect(0, 0, width, height);
      context.save();

      const scale = 1 - value * 0.105;
      context.translate(width / 2, height / 2);
      context.scale(scale, scale);
      context.translate(-width / 2, -height / 2);
      context.globalAlpha = 0.92 - value * 0.16;

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > linkDistance) continue;

          const base = (1 - distance / linkDistance) * (0.11 + value * 0.08);
          const boost = pulseStrength(
            (a.x + b.x) / 2,
            (a.y + b.y) / 2,
            value
          );
          context.strokeStyle =
            boost > 0.025
              ? `rgba(${crimsonRGB}, ${Math.min(0.82, base + boost * 0.68)})`
              : `rgba(${inkRGB}, ${base})`;
          context.lineWidth = boost > 0.3 ? 1.15 : 0.7;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      for (const node of nodes) {
        const boost = pulseStrength(node.x, node.y, value);
        context.beginPath();
        context.arc(node.x, node.y, 1.45 + boost * 2.65, 0, Math.PI * 2);
        context.fillStyle =
          boost > 0.12
            ? `rgba(${crimsonRGB}, ${0.42 + boost * 0.5})`
            : `rgba(${inkRGB}, ${0.24 + value * 0.08})`;
        context.fill();
      }

      context.restore();
    };

    const measure = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const sceneRect = scene.getBoundingClientRect();
      width = canvasRect.width;
      height = canvasRect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      scrollStart = sceneRect.top + window.scrollY;
      scrollRange = Math.max(sceneRect.height * 0.82, window.innerHeight * 0.72);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    };

    const paintScroll = () => {
      frame = 0;
      progress = motionQuery.matches
        ? 0
        : clamp((window.scrollY - scrollStart) / scrollRange);
      scene.style.setProperty("--hero-progress", String(progress));
      scene.style.setProperty("--hero-content-y", `${progress * -28}px`);
      scene.style.setProperty("--hero-content-opacity", String(1 - progress * 0.72));
      scene.style.setProperty("--hero-media-scale", String(1 - progress * 0.035));
      draw();
    };

    const requestPaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paintScroll);
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      requestPaint();
    });
    const themeObserver = new MutationObserver(() => {
      readColors();
      requestPaint();
    });
    const onMotionChange = () => requestPaint();

    readColors();
    measure();
    paintScroll();
    resizeObserver.observe(scene);
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint);
    motionQuery.addEventListener("change", onMotionChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestPaint);
      motionQuery.removeEventListener("change", onMotionChange);
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
        preload="metadata"
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    );
  }

  return <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />;
}
