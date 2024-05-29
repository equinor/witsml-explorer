import { createSearchParams } from "react-router-dom";
import { formatIndexValue } from "../../tools/IndexHelpers";

export const createLogCurveValuesSearchParams = (
  startIndex?: string | number,
  endIndex?: string | number,
  mnemonics?: string[] | Record<string, string[]>
): URLSearchParams => {
  let searchParams = {};
  if (startIndex !== null && startIndex !== undefined) {
    const startIndexFormatted = formatIndexValue(startIndex);
    searchParams = { startIndex: startIndexFormatted };
  }
  if (endIndex !== null && endIndex !== undefined) {
    const endIndexFormatted = formatIndexValue(endIndex);
    searchParams = { ...searchParams, endIndex: endIndexFormatted };
  }
  if (mnemonics) {
    const mnemonicsFormatted = JSON.stringify(mnemonics);
    searchParams = { ...searchParams, mnemonics: mnemonicsFormatted };
  }
  return createSearchParams(searchParams);
};
