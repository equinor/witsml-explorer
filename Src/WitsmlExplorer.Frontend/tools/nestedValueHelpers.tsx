export function getNestedValue(obj: any, path: string): any {
  return path?.split(".").reduce((acc, part) => acc && acc[part], obj);
}
