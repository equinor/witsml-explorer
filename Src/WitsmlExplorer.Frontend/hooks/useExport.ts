export interface ExportOptions {
  outputMimeType: string;
  fileExtension: string;
  separator: string;
  newLineCharacter: string;
  omitSpecialCharacters?: boolean;
}
interface ExportReturn {
  exportData: (fileName: string, header: string, data: string) => void;
  options: ExportOptions;
}
function omitSpecialCharacters(text: string): string {
  return text.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, "_");
}
function useExport(props: ExportOptions): ExportReturn {
  const exportData = (fileName: string, header: string, data: string) => {
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(
      new Blob([header, props.newLineCharacter, data], {
        type: props.outputMimeType
      })
    );
    link.download = props.omitSpecialCharacters ? omitSpecialCharacters(fileName) + props.fileExtension : `${fileName}${props.fileExtension}`;
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
      window.URL.revokeObjectURL(link.href);
      link.remove();
    }, 200);
  };
  return { exportData: exportData, options: props };
}

export default useExport;
