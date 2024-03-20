export interface ExportProperties {
  outputMimeType: string;
  fileExtension: string;
  separator: string;
  newLineCharacter: string;
  omitSpecialCharactersFromFilename?: boolean;
  appendDateTime?: boolean;
}

export const defaultExportProperties = {
  fileExtension: ".csv",
  newLineCharacter: "\n",
  outputMimeType: "text/csv",
  separator: ",",
  omitSpecialCharactersFromFilename: true,
  appendDateTime: true
};
