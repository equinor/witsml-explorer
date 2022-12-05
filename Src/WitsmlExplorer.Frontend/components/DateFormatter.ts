import { format, formatInTimeZone, toDate } from "date-fns-tz";
import { TimeZone } from "../contexts/operationStateReducer";

//https://date-fns.org/v2.29.3/docs/format
const dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX";

// Minus character U+2212 is preferred by ISO 8601 over hyphen minus '-' so we check both
// date-fns-tz behaves weirdly with minus so we replace it
const unicodeMinus = "\u2212";

function formatDateString(dateString: string, timeZone: TimeZone) {
  try {
    if (dateString == null) {
      return null;
    }

    const replaced = dateString.replace(unicodeMinus, "-");
    const parsed = toDate(replaced);

    if (timeZone == TimeZone.Raw) {
      const offset = getOffset(replaced) ?? "Z";
      return formatInTimeZone(parsed, offset, dateTimeFormat);
    }

    if (timeZone == TimeZone.Local) {
      return format(parsed, dateTimeFormat);
    }
    return formatInTimeZone(parsed, timeZone, dateTimeFormat);
  } catch (e) {
    return "Invalid date";
  }
}
export default formatDateString;

export function getOffsetFromTimeZone(timeZone: TimeZone): string {
  return formatInTimeZone(new Date(), timeZone, "xxx");
}

function getOffset(dateString: string): string | null {
  if (dateString.indexOf("Z") == dateString.length - 1) {
    return "Z";
  }

  const replaced = dateString.replace(unicodeMinus, "-");
  const charAtSignPosition = replaced.charAt(replaced.length - 6);
  if (charAtSignPosition == "+" || charAtSignPosition == "-") {
    const offset = dateString.slice(dateString.length - 6);
    return validateOffset(offset) ? offset : null;
  }

  return null;
}

function validateOffset(offset: string): boolean {
  try {
    return offset.match(/[+-][0-2]\d:[0-5]\d|Z/)[0] == offset;
  } catch {
    return false;
  }
}

export function validateIsoDateString(dateString: string): boolean {
  try {
    const replaced = dateString.replace(unicodeMinus, "-").replace("+00:00", "Z").replace("-00:00", "Z");
    const offset = getOffset(replaced);
    if (!offset) {
      return false;
    }
    const parsed = toDate(replaced);
    const formatted = formatInTimeZone(parsed, offset, dateTimeFormat);
    return replaced == formatted;
  } catch {
    return false;
  }
}
