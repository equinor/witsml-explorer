import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-prompt";
import "ace-builds/src-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-merbivore";
import "ace-builds/src-noconflict/theme-xcode";
import { customCommands, customCompleter } from "components/QueryEditorUtils";
import { updateLinesWithWidgets } from "components/QueryEditorWidgetUtils";
import { useOperationState } from "hooks/useOperationState";
import AceEditor from "react-ace";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { Colors, dark } from "styles/Colors";
import React, { FC, useState } from "react";
import { Chip } from "./StyledComponents/Chip";
import Icon from "../styles/Icons.tsx";
import { Stack } from "@mui/material";
import { UserTheme } from "../contexts/operationStateReducer.tsx";

export interface QueryEditorProps {
  value: string;
  onChange?: (newValue: string) => void;
  showCommandPaletteOption?: boolean;
  readonly?: boolean;
}

export const QueryEditor: FC<QueryEditorProps> = ({
  value,
  onChange,
  readonly,
  showCommandPaletteOption
}) => {
  const [ace, setAce] = useState<null | any>(null);

  const navigate = useNavigate();
  const { serverUrl } = useParams();
  const {
    operationState: { colors, theme }
  } = useOperationState();

  const isCompact = theme === UserTheme.Compact;

  const onLoadInternal = (editor: any) => {
    editor.renderer.setPadding(10);
    editor.renderer.setScrollMargin(10);

    if (readonly) editor.renderer.$cursorLayer.element.style.display = "none";
    else editor.completers = [customCompleter];

    editor.renderer.on("afterRender", (_: any, renderer: any) => {
      updateLinesWithWidgets(editor, renderer, navigate, serverUrl, readonly);
      if (showCommandPaletteOption) setAce(editor);
    });
  };

  const canSeeCommandPalette = showCommandPaletteOption && ace && !readonly;

  return (
    <>
      <StyledAceEditor
        value={value}
        colors={colors}
        mode="xml"
        theme={colors === dark ? "merbivore" : "xcode"}
        onChange={onChange}
        onLoad={onLoadInternal}
        readOnly={readonly}
        fontSize={isCompact ? "0.75rem" : 13}
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
      {canSeeCommandPalette && (
        <Stack pl="1rem" justifyContent="flex-end" direction="row">
          <Chip
            onClick={() => {
              ace.execCommand("openCommandPalette");
            }}
            title="Show command palette [F1]"
          >
            <Icon name="keyboard" />
            Command Palette
          </Chip>
        </Stack>
      )}
    </>
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
