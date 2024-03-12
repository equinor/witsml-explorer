import { MAX_URL_LENGTH } from "components/Constants";
import { URLSearchParamsInit, createSearchParams } from "react-router-dom";

export const checkIsUrlTooLong = (
  pathname: string,
  searchParams: URLSearchParamsInit | string
): boolean => {
  let searchParamsUrlFormat = "";
  if (typeof searchParams === "string") {
    searchParamsUrlFormat = searchParams;
  } else {
    searchParamsUrlFormat = createSearchParams(searchParams).toString();
  }
  const pathnameLength = pathname.length;
  const searchParamsLength = searchParamsUrlFormat.length;
  return pathnameLength + searchParamsLength > MAX_URL_LENGTH;
};
