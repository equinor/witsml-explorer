import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-merbivore";
import "ace-builds/src-noconflict/theme-xcode";
import { customCommands, customCompleter } from "components/QueryEditorUtils";
import { updateLinesWithWidgets } from "components/QueryEditorWidgetUtils";
import { useOperationState } from "hooks/useOperationState";
import AceEditor from "react-ace";
import styled from "styled-components";
import { Colors, dark } from "styles/Colors";

export interface QueryEditorProps {
  value: string;
  onChange?: (newValue: string) => void;
  readonly?: boolean;
}

export const QueryEditor = (props: QueryEditorProps) => {
  const { value, onChange, readonly } = props;
  const {
    operationState: { colors }
  } = useOperationState();

  const onLoad = (editor: any) => {
    editor.renderer.setPadding(10);
    editor.renderer.setScrollMargin(10);
    if (readonly) {
      editor.renderer.$cursorLayer.element.style.display = "none";
    } else {
      editor.completers = [customCompleter];
      editor.renderer.on("afterRender", (_: any, renderer: any) =>
        updateLinesWithWidgets(editor, renderer)
      );
    }
  };

  return (
    <StyledAceEditor
      value={value}
      colors={colors}
      mode="xml"
      theme={colors === dark ? "merbivore" : "xcode"}
      onChange={onChange}
      onLoad={onLoad}
      readOnly={readonly}
      fontSize={13}
      showPrintMargin={false}
      highlightActiveLine={false}
      setOptions={{
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
        useWorker: false,
        highlightGutterLine: false
      }}
      commands={customCommands}
    />
  );
};

const StyledAceEditor = styled(AceEditor)<{ colors: Colors }>`
  min-width: 100%;
  min-height: 100%;
  background-color: ${(props) => props.colors.ui.backgroundLight};

  .ace_gutter {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
`;
