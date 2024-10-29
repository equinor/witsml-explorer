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
    const endOfCurveNameIndex = line.indexOf(".");
    const curveName = line
      .slice(0, endOfCurveNameIndex)
      .trim()
      .replaceAll(" ", "_");
    const unit = line.slice(endOfCurveNameIndex + 1).split(/\s+/)[0];
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
  const logData = lines.map((line) => {
    // Split the lines on whitespaces, but keep entries if surrounded by "".
    const matches = line.match(/"[^"]*"|\S+/g) || [];
    const cells = matches.map((cell) => cell.replace(/^"|"$/g, ""));
    return cells.join(",");
  });
  return logData;
};

/**
 * Extracts the content of the first matching section from a LAS data string based on the provided section names.
 *
 * @param lasData - A string containing the entire LAS data.
 * @param sectionNames - One or more section names to search for, e.g., 'CURVE INFORMATION'.
 *                        The function will return the content of the first section that matches.
 *                        If no exact line matches are found, it will look for matches that starts on the given strings.
 * @returns The content of the first matching section as a string. Returns an empty string
 *          if none of the specified sections are found or if the section is incorrectly formatted.
 */
export const extractLASSection = (
  lasData: string,
  ...sectionNames: string[]
): string => {
  const getSection = (exactMatch: boolean) => {
    for (const sectionName of sectionNames) {
      const searchString = exactMatch
        ? `\n~${sectionName}\\s*$`
        : `\n~${sectionName}`;
      const sectionPattern = new RegExp(searchString, "m");
      const sectionMatch = sectionPattern.exec(lasData);
      if (sectionMatch) {
        const sectionIndex = sectionMatch.index;
        const startIndex =
          lasData.indexOf("\n", sectionIndex + sectionMatch[0].length) + 1;
        if (startIndex === -1) return "";
        const endIndex = lasData.indexOf("\n~", startIndex);
        const sectionEndIndex = endIndex !== -1 ? endIndex : undefined;
        const sectionData = lasData.slice(startIndex, sectionEndIndex);
        return sectionData;
      }
    }
    return null;
  };

  return getSection(true) ?? getSection(false) ?? "";
};
