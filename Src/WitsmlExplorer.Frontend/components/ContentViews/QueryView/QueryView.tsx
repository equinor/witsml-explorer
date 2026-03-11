import { Tabs } from "@equinor/eds-core-react";
import { QueryEditor } from "components/QueryEditor";
import { getTag } from "components/QueryEditorUtils";
import { QueryActionType, QueryContext } from "contexts/queryContext";
import { useOperationState } from "hooks/useOperationState";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import styled from "styled-components";
import Icon from "styles/Icons";

import { Box } from "@mui/material";
import QueryDataGrid from "components/ContentViews/QueryDataGrid";
import { QueryEditorTypes } from "components/ContentViews/QueryView/components/QueryOptions/QueryOptions";
import ResultMeta from "components/ContentViews/QueryView/components/ResultMeta";
import { StyledTab } from "components/StyledComponents/StyledTab";
import { Colors } from "styles/Colors";
import QueryOptions from "./components/QueryOptions";

const MIN_LEFT_PANEL_WIDTH = 500;

const QueryView = (): React.ReactElement => {
  const {
    operationState: { colors }
  } = useOperationState();
  const {
    queryState: { queries, tabIndex },
    dispatchQuery
  } = useContext(QueryContext);
  const [editorType, setEditorType] = useState<QueryEditorTypes>(
    QueryEditorTypes.AceEditor
  );
  const leftPaneRef = useRef<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeWidth, setResizeWidth] = useState<number | null>(null);

  const { query, result } = queries[tabIndex];

  const onQueryChange = (newValue: string) => {
    dispatchQuery({ type: QueryActionType.SetQuery, query: newValue });
  };

  const onTabChange = (index: number) => {
    if (index >= queries.length) {
      dispatchQuery({ type: QueryActionType.AddTab });
    } else {
      dispatchQuery({ type: QueryActionType.SetTabIndex, tabIndex: index });
    }
  };

  const onCloseTab = (event: React.MouseEvent, tabId: string) => {
    event.stopPropagation();
    dispatchQuery({ type: QueryActionType.RemoveTab, tabId });
  };

  const getTabName = (query: string) => {
    return (
      getTag(query.split("\n")?.[0]) ?? (query.split("\n")?.[0] || "Empty")
    );
  };

  const startResizing = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      setIsResizing(true);
      event.preventDefault();
      event.stopPropagation();
      setResizeWidth(
        leftPaneRef.current?.getBoundingClientRect().width ??
          MIN_LEFT_PANEL_WIDTH
      );
    },
    []
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (event: MouseEvent) => {
      if (isResizing) {
        event.stopPropagation();
        event.preventDefault();
        setResizeWidth((previousWidth) =>
          Math.max(
            (previousWidth ?? MIN_LEFT_PANEL_WIDTH) + event.movementX,
            MIN_LEFT_PANEL_WIDTH
          )
        );
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <Layout>
      <Tabs
        activeTab={tabIndex}
        onChange={onTabChange}
        scrollable
        style={{ whiteSpace: "nowrap" }}
      >
        <Tabs.List>
          {queries.map((query) => (
            <StyledTab key={query.tabId} colors={colors}>
              {getTabName(query.query)}
              <StyledClearIcon
                name="clear"
                size={16}
                onClick={(event) => onCloseTab(event, query.tabId)}
              />
            </StyledTab>
          ))}
          <StyledTab colors={colors}>
            <Icon name="add" />
          </StyledTab>
        </Tabs.List>
      </Tabs>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: resizeWidth
            ? `${resizeWidth}px auto 1fr`
            : "1fr auto 1fr",
          height: "100%",
          padding: "1rem 0rem"
        }}
      >
        <Box
          ref={leftPaneRef}
          display="grid"
          gridTemplateRows="auto 1fr auto"
          gap="0.5rem"
          height="100%"
          pr="2px"
        >
          <QueryOptions
            onQueryChange={onQueryChange}
            onChangeEditorType={setEditorType}
            editorType={editorType}
          />
          {editorType === QueryEditorTypes.DataGrid ? (
            <QueryDataGrid />
          ) : (
            <QueryEditor
              value={query}
              onChange={onQueryChange}
              showCommandPaletteOption
            />
          )}
        </Box>
        <ResizeDivider onMouseDown={startResizing} colors={colors} />
        <Box
          display="grid"
          gridTemplateRows="auto 1fr"
          gap="1rem"
          height="100%"
          pr="2px"
        >
          <ResultMeta />
          <QueryEditor value={result} readonly />
        </Box>
      </div>
    </Layout>
  );
};

const Layout = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  padding: 1rem;
`;

const StyledClearIcon = styled(Icon)`
  margin-left: 8px;
  border-radius: 50%;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const ResizeDivider = styled.div<{ colors: Colors }>`
  justify-self: flex-end;
  cursor: col-resize;
  resize: horizontal;
  width: 0.2rem;
  margin: 0 0.3rem 0 0.3rem;
  background: ${(props) => props.colors.interactive.sidebarDivider};
  border-radius: 5px;
  &:hover {
    background: ${(props) => props.colors.interactive.sidebarDivider};
    width: 0.4rem;
    margin: 0 0.2rem 0 0.2rem;
  }
`;

export default QueryView;
