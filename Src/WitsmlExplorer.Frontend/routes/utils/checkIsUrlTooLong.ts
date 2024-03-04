import { URLSearchParamsInit, createSearchParams } from "react-router-dom";
import { MAX_URL_LENGTH } from "../../components/Constants";

export const checkIsUrlTooLong = (
  pathname: string,
  searchParams: URLSearchParamsInit
): boolean => {
  const searchParamsUrlFormat = createSearchParams(searchParams).toString();
  const pathnameLength = pathname.length;
  const searchParamsLength = searchParamsUrlFormat.length;
  return pathnameLength + searchParamsLength > MAX_URL_LENGTH;
};
