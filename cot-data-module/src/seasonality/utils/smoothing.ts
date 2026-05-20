export function circularMovingAverage(values: number[], windowSize: number): number[] {
  const n = values.length;
  if (n === 0) return [];
  const half = Math.floor(windowSize / 2);
  const out: number[] = [];

  for (let i = 0; i < n; i++) {
    let sum = 0;
    let count = 0;
    for (let k = -half; k <= half; k++) {
      const idx = (i + k + n) % n;
      sum += values[idx];
      count += 1;
    }
    out.push(sum / count);
  }

  return out;
}
