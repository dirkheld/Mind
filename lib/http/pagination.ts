export function parsePage(value: unknown) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;
  return Math.max(1, Math.min(10000, Number(value)));
}
