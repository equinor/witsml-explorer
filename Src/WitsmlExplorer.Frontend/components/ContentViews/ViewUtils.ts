export const clipLongString = (toClip: string, length: number, onNull?: string): string => {
  if (!toClip) {
    return onNull ?? "";
  }
  return toClip.length > length ? `${toClip.substring(0, length).trim()}…` : toClip;
};
