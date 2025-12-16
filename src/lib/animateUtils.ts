/**
 * Easing functions for smooth animations
 */
export const easing = {
  easeOut: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number): number =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  elastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * Generate breathing animation value (sinusoidal)
 */
export function breathingValue(time: number, amplitude: number = 1, frequency: number = 1): number {
  return 1 + Math.sin(time * frequency) * amplitude;
}

/**
 * Generate idle oscillation for nodes
 */
export function idleOscillation(
  time: number,
  baseX: number,
  baseY: number,
  amplitude: number = 3
): { x: number; y: number } {
  return {
    x: baseX + Math.sin(time * 0.5) * amplitude,
    y: baseY + Math.cos(time * 1.2) * amplitude,
  };
}

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

