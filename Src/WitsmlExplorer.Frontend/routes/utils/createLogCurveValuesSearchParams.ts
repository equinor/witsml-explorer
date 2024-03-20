import { createSearchParams } from "react-router-dom";
import { formatIndexValue } from "../../tools/IndexHelpers";

export const createLogCurveValuesSearchParams = (
  startIndex?: string | number,
  endIndex?: string | number,
  mnemonics?: string[]
): URLSearchParams => {
  let searchParams = {};
  if (startIndex) {
    const startIndexFormatted = formatIndexValue(startIndex);
    searchParams = { startIndex: startIndexFormatted };
  }
  if (endIndex) {
    const endIndexFormatted = formatIndexValue(endIndex);
    searchParams = { ...searchParams, endIndex: endIndexFormatted };
  }
  if (mnemonics) {
    const mnemonicsFormatted = JSON.stringify(mnemonics);
    searchParams = { ...searchParams, mnemonics: mnemonicsFormatted };
  }
  return createSearchParams(searchParams);
};
