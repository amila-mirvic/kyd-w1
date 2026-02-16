/**
 * Generic scoring helpers (NEW)
 * These utilities should be pure functions so you can test them easily.
 */

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function sum(nums) {
  return (nums || []).reduce((a, b) => a + b, 0);
}
