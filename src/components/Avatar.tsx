"use client";

import { useEffect, useRef } from "react";
import type { AvatarId } from "@/lib/presets";

export interface AvatarPalette {
  avatar: AvatarId;
}

/** Relaxed, then watchful, then openly suspicious. */
function faceFor(suspicion: number): "happy" | "chill" | "suspicious" {
  if (suspicion < 35) return "happy";
  if (suspicion < 60) return "chill";
  return "suspicious";
}

/**
 * Illustrated character portrait. The face changes with suspicion; the portrait bobs with the
 * NPC's output volume (no lip-sync). Animation runs in rAF and writes the transform directly so
 * the page does not re-render every frame.
 */
export function Avatar({
  palette,
  suspicion,
  getLevel,
  className = "",
}: {
  palette: AvatarPalette;
  /** 0..100, already smoothed by the caller. */
  suspicion: number;
  /** Returns the current speaking volume 0..1. */
  getLevel: () => number;
  className?: string;
}) {
  const img = useRef<HTMLImageElement>(null);
  const level = useRef(getLevel);
  useEffect(() => {
    level.current = getLevel;
  }, [getLevel]);

  useEffect(() => {
    let raf = 0;
    let open = 0;
    const loop = () => {
      const raw = Math.min(1, Math.max(0, level.current() * 2.2));
      open += (raw - open) * (raw > open ? 0.55 : 0.25);
      img.current?.style.setProperty("transform", `translateY(${(-open * 4).toFixed(2)}%) scale(${(1 + open * 0.03).toFixed(3)})`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static portraits, swapped per mood
    <img
      ref={img}
      src={`/avatars/${palette.avatar}/${faceFor(suspicion)}.png`}
      alt="NPC avatar"
      draggable={false}
      className={`aspect-square select-none object-contain ${className}`}
    />
  );
}
