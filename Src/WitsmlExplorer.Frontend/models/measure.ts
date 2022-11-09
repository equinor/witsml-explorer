export default interface Measure {
  value: number;
  uom: string;
}

export function measureToString(measure: Measure): string {
  return `${measure?.value?.toFixed(4) ?? ""} ${measure?.uom ?? ""}`;
}
