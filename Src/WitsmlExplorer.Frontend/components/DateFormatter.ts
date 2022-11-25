import { format, formatInTimeZone, toDate } from "date-fns-tz";
import { TimeZone } from "../contexts/operationStateReducer";

const dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS";

//https://date-fns.org/v2.29.3/docs/format
function formatDateString(dateString: string, timeZone: TimeZone) {
  if (dateString == null) {
    return null;
  }

  if (timeZone == TimeZone.Raw) {
    return dateString.replace("+00:00", "Z");
  }

  const parsed = toDate(dateString);
  if (timeZone == TimeZone.Local) {
    return format(parsed, dateTimeFormat);
  }
  return formatInTimeZone(parsed, timeZone, dateTimeFormat);
}

export default formatDateString;
