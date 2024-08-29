/**
 * Parses LAS header section data to extract curve names and units.
 *
 * @param sectionData - A string containing the LAS header section data.
 * @returns An array of objects, each containing the index, curve name, and unit.
 * Each object represents a curve from the LAS header section.
 */
export const parseLASHeader = (sectionData: string) => {
  const lines = sectionData
    .split("\n")
    .filter((line) => line.trim() != "" && !line.startsWith("#"));
  const headerData = lines.map((line, index) => {
    const endOfCurveNameIndex = line.indexOf(" .");
    const curveName = line.slice(0, endOfCurveNameIndex).trim();
    const unit = line.slice(endOfCurveNameIndex + 2).split(/\s+/)[0];
    return {
      index,
      name: curveName,
      unit: unit
    };
  });
  return headerData;
};

/**
 * Parses LAS data section to extract log data.
 *
 * @param sectionData - A string containing the LAS data section.
 * @returns An array of strings where each string represents a line of log data with comma-separated values.
 */
export const parseLASData = (sectionData: string) => {
  const lines = sectionData
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line != "" && !line.startsWith("#"));
  const logData = lines.map((line) => line.split(/\s+/).join(","));
  return logData;
};

/**
 * Extracts the content of a specific section from a LAS data string.
 *
 * @param lasData - A string containing the entire LAS data.
 * @param sectionName - The name of the section to extract, e.g., 'CURVE INFORMATION'.
 * @returns The content of the specified section as a string. Returns an empty string
 * if the section is not found or is incorrectly formatted.
 */
export const extractLASSection = (
  lasData: string,
  sectionName: string
): string => {
  const sectionPattern = new RegExp(`\n~${sectionName}\\s*$`, "m");
  const sectionMatch = sectionPattern.exec(lasData);
  if (!sectionMatch) return "";
  const sectionIndex = sectionMatch.index;
  const startIndex =
    lasData.indexOf("\n", sectionIndex + sectionMatch[0].length) + 1;
  if (startIndex === -1) return "";
  const endIndex = lasData.indexOf("\n~", startIndex);
  const sectionEndIndex = endIndex !== -1 ? endIndex : undefined;
  const sectionData = lasData.slice(startIndex, sectionEndIndex);
  return sectionData;
};
