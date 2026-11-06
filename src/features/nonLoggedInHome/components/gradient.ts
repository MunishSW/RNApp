/**
 * Converts a CSS linear-gradient angle into an SVG userSpaceOnUse line for a w x h box,
 * so the Figma 133.8 degree gradient renders the same way (FR-4.3-01).
 */
export interface GradientLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function cssAngleToSvgLine(angleDeg: number, width: number, height: number): GradientLine {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const length = Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));
  const cx = width / 2;
  const cy = height / 2;
  return {
    x1: cx - (dx * length) / 2,
    y1: cy - (dy * length) / 2,
    x2: cx + (dx * length) / 2,
    y2: cy + (dy * length) / 2,
  };
}
