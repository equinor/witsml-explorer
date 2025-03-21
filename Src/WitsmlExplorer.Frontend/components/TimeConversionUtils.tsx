export const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

export const convertMillisecondsToTimeString = (ms: number): string => {
  const date = new Date(ms);
  return (
    ("" + date.getUTCHours()).padStart(2, "0") +
    ":" +
    ("" + date.getUTCMinutes()).padStart(2, "0") +
    ":" +
    ("" + date.getUTCSeconds()).padStart(2, "0")
  );
};

export const convertTimeStringToMilliseconds = (time: string): number => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};
