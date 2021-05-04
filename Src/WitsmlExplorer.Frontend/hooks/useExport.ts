export interface ExportOptions {
  outputMimeType: string;
  fileExtension: string;
  separator: string;
  newLineCharacter: string;
  omitSpecialCharacters?: boolean;
  appendTimeStamp?: boolean;
}
interface ExportReturn {
  exportData: (fileName: string, header: string, data: string) => void;
  options: ExportOptions;
}
function omitSpecialCharacters(text: string): string {
  return text.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "_");
}
function appendTimeStamp(append: boolean): string {
  return append ? `-${Date.now()}` : "";
}
function useExport(props: ExportOptions): ExportReturn {
  const exportData = (fileName: string, header: string, data: string) => {
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(
      new Blob([header, props.newLineCharacter, data], {
        type: props.outputMimeType
      })
    );
    link.download = props.omitSpecialCharacters
      ? `${omitSpecialCharacters(fileName)}${appendTimeStamp(props.appendTimeStamp)}${props.fileExtension}`
      : `${fileName}${appendTimeStamp(props.appendTimeStamp)}${props.fileExtension}`;
    document.body.appendChild(link);
    link.click();
    //we might not need a timeout for clean up
    setTimeout(function () {
      window.URL.revokeObjectURL(link.href);
      link.remove();
    }, 200);
  };
  return { exportData: exportData, options: props };
}

export default useExport;
