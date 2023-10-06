import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-xcode";
import { useContext } from "react";
import AceEditor from "react-ace";
import styled from "styled-components";
import OperationContext from "../contexts/operationContext";
import { Colors, dark } from "../styles/Colors";
import { customCompleter } from "./QueryEditorUtils";

export interface QueryEditorProps {
  value: string;
  onChange?: (newValue: string) => void;
  readonly?: boolean;
}

export const QueryEditor = (props: QueryEditorProps) => {
  const { value, onChange, readonly } = props;
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  const onLoad = (editor: any) => {
    editor.renderer.setPadding(10);
    editor.renderer.setScrollMargin(10);
    if (readonly) {
      editor.renderer.$cursorLayer.element.style.display = "none";
    } else {
      editor.completers = [customCompleter];
    }
  };

  return (
    <StyledAceEditor
      value={value}
      colors={colors}
      mode="xml"
      theme={colors == dark ? "monokai" : "xcode"}
      onChange={onChange}
      onLoad={onLoad}
      readOnly={readonly}
      fontSize={14}
      showPrintMargin={false}
      showGutter={false}
      highlightActiveLine={false}
      setOptions={{
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        showLineNumbers: false,
        tabSize: 2,
        useWorker: false
      }}
    />
  );
};

const StyledAceEditor = styled(AceEditor)<{ colors: Colors }>`
  min-width: 100%;
  min-height: 100%;
  background-color: ${(props) => props.colors.ui.backgroundLight};
`;
