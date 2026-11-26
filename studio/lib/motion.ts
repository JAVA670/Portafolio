/**
 * Linear map from one range to another, clamped — for scroll-linked values.
 *
 * Use it as a function transform, `useTransform(progress, (p) => ramp(p, …))`,
 * rather than the array form for opacity: Framer Motion hands array-form
 * opacity over to the browser's native scroll timelines, whose range
 * maths can drift from the JS-driven transforms on sticky sections (the
 * fade and the zoom then disagree). A function keeps it on the JS path.
 */
export function ramp(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}
