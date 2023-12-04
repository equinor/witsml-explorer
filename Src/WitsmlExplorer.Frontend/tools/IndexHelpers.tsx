export const indexToNumber = (index: string): number => {
  if (!index) return null;
  return Number(index.replace(/[^\d.-]/g, ""));
};

export const formatIndexValue = (value: string | number): string => {
  return typeof value === "number" ? String(value) : value;
};
