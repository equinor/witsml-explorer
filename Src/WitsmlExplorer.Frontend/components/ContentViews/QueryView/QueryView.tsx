import { Tabs } from "@equinor/eds-core-react";
import { QueryEditor } from "components/QueryEditor";
import { getTag } from "components/QueryEditorUtils";
import { QueryActionType, QueryContext } from "contexts/queryContext";
import { useOperationState } from "hooks/useOperationState";
import React, { useContext, useState } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

import { Box } from "@mui/material";
import QueryDataGrid from "components/ContentViews/QueryDataGrid";
import { QueryEditorTypes } from "components/ContentViews/QueryView/components/QueryOptions/QueryOptions";
import ResultMeta from "components/ContentViews/QueryView/components/ResultMeta";
import QueryOptions from "./components/QueryOptions";

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
          gridTemplateColumns: "1fr 1fr",
          height: "100%",
          padding: "1rem 0rem"
        }}
      >
        <Box
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

const StyledTab = styled(Tabs.Tab)<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
`;

export default QueryView;
