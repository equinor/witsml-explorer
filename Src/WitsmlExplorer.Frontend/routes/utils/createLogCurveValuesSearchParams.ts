import { createSearchParams } from "react-router-dom";
import { formatIndexValue } from "../../tools/IndexHelpers";

export const createLogCurveValuesSearchParams = (
  startIndex: string | number,
  endIndex: string | number,
  mnemonics?: string[]
): URLSearchParams => {
  const startIndexFormatted = formatIndexValue(startIndex);
  const endIndexFormatted = formatIndexValue(endIndex);

  if (mnemonics) {
    const mnemonicsFormatted = JSON.stringify(mnemonics);
    return createSearchParams({
      mnemonics: mnemonicsFormatted,
      startIndex: startIndexFormatted,
      endIndex: endIndexFormatted
    });
  }
  return createSearchParams({
    startIndex: startIndexFormatted,
    endIndex: endIndexFormatted
  });
};
