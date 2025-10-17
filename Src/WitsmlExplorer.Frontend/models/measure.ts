export default interface Measure {
  value: number;
  uom: string;
}

export function measureToString(measure: Measure, decimals?: number): string {
  if (decimals && measure?.value) {
    return `${measure?.value?.toFixed(decimals) ?? ""} ${measure?.uom ?? ""}`;
  }
  return `${measure?.value ?? ""} ${measure?.uom ?? ""}`;
}
