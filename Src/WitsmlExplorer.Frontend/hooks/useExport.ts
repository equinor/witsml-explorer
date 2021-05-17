export interface ExportProperties {
  outputMimeType: string;
  fileExtension: string;
  separator: string;
  newLineCharacter: string;
  omitSpecialCharactersFromFilename?: boolean;
  appendDateTime?: boolean;
}
interface ExportObject {
  exportData: (fileName: string, header: string, data: string) => void;
  properties: ExportProperties;
}
function omitSpecialCharacters(text: string): string {
  return text.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "_");
}
function appendDateTime(append: boolean): string {
  const now = new Date();
  return append ? `-${now.getFullYear()}-${now.getMonth()}-${now.getDay()}T${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}` : "";
}
function useExport(props: ExportProperties): ExportObject {
  const exportData = (fileName: string, header: string, data: string) => {
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(
      new Blob([header, props.newLineCharacter, data], {
        type: props.outputMimeType
      })
    );
    link.download = props.omitSpecialCharactersFromFilename
      ? `${omitSpecialCharacters(fileName)}${appendDateTime(props.appendDateTime)}${props.fileExtension}`
      : `${fileName}${appendDateTime(props.appendDateTime)}${props.fileExtension}`;
    document.body.appendChild(link);
    link.click();
    //we might not need a timeout for clean up
    setTimeout(function () {
      window.URL.revokeObjectURL(link.href);
      link.remove();
    }, 200);
  };
  return { exportData: exportData, properties: props };
}

export default useExport;
