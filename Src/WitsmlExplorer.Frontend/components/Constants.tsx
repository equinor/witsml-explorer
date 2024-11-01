export const WITSML_INDEX_TYPE_MD = "measured depth";
export const WITSML_INDEX_TYPE_DATE_TIME = "date time";
export type WITSML_INDEX_TYPE =
  | typeof WITSML_INDEX_TYPE_MD
  | typeof WITSML_INDEX_TYPE_DATE_TIME;
export const WITSML_LOG_ORDERTYPE_DECREASING = "decreasing";

export const DateFormat = {
  DATE: "DD.MM.YYYY",
  DATETIME_S: "DD.MM.YYYY HH:mm:ss",
  DATETIME_MS: "DD.MM.YYYY HH:mm:ss.SSS"
};

export const MILLIS_IN_SECOND = 1000;
export const SECONDS_IN_MINUTE = 60;

export const MAX_URL_LENGTH = 2000;
