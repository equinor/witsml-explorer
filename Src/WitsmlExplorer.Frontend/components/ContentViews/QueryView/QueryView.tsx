import { Tabs } from "@equinor/eds-core-react";
import {
  formatXml,
  getParserError,
  ReturnElements,
  StoreFunction
} from "components/ContentViews/QueryViewUtils";
import ConfirmModal from "components/Modals/ConfirmModal";
import { QueryEditor } from "components/QueryEditor";
import { getTag } from "components/QueryEditorUtils";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { QueryActionType, QueryContext } from "contexts/queryContext";
import { useOperationState } from "hooks/useOperationState";
import React, { useContext, useState } from "react";
import QueryService from "services/queryService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

import { Box, Stack } from "@mui/material";
import { Button } from "../../StyledComponents/Button.tsx";
import QueryOptions from "./components/QueryOptions";

const QueryView = (): React.ReactElement => {
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();
  const {
    queryState: { queries, tabIndex },
    dispatchQuery
  } = useContext(QueryContext);
  const [isLoading, setIsLoading] = useState(false);

  const { query, result, storeFunction, returnElements, optionsIn } =
    queries[tabIndex];

  const validateAndFormatQuery = (): boolean => {
    const formattedQuery = formatXml(query);
    const parserError = getParserError(formattedQuery);
    if (parserError) {
      dispatchQuery({ type: QueryActionType.SetResult, result: parserError });
    } else if (formattedQuery !== query) {
      onQueryChange(formattedQuery);
    }
    return !parserError;
  };

  const sendQuery = () => {
    const getResult = async (dispatchOperation?: DispatchOperation | null) => {
      dispatchOperation?.({ type: OperationType.HideModal });
      setIsLoading(true);
      const requestReturnElements =
        storeFunction === StoreFunction.GetFromStore &&
        returnElements !== ReturnElements.None
          ? returnElements
          : undefined;
      let response = await QueryService.postQuery(
        query,
        storeFunction,
        requestReturnElements,
        optionsIn?.trim()
      );
      if (response.startsWith("<")) {
        response = formatXml(response);
      }
      dispatchQuery({ type: QueryActionType.SetResult, result: response });
      setIsLoading(false);
    };
    const isValid = validateAndFormatQuery();
    if (!isValid) return;
    if (storeFunction === StoreFunction.DeleteFromStore) {
      displayConfirmation(
        () => getResult(dispatchOperation),
        dispatchOperation
      );
    } else {
      getResult();
    }
  };

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
      <Stack
        direction="row"
        gap="1rem"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Box
          sx={{
            flexBasis: "100%",
            width: 0,
            minWidth: 0
          }}
        >
          <Tabs
            activeTab={tabIndex}
            onChange={onTabChange}
            scrollable
            style={{ overflowX: "auto", whiteSpace: "nowrap" }}
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
        </Box>
        <Button onClick={sendQuery} disabled={isLoading}>
          <Icon name="play" />
          Execute
        </Button>
      </Stack>
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
          gap="1rem"
          height="100%"
          pr="2px"
        >
          <QueryOptions />
          <QueryEditor
            value={query}
            onChange={onQueryChange}
            showCommandPaletteOption
          />
        </Box>
        <div>
          <QueryEditor value={result} readonly />
        </div>
      </div>
    </Layout>
  );
};

const displayConfirmation = (
  onConfirm: () => void,
  dispatchOperation: DispatchOperation
) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete object?"}
      content={<span>Are you sure you want to delete this object?</span>}
      onConfirm={onConfirm}
      confirmColor={"danger"}
      confirmText={"Delete"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({
    type: OperationType.DisplayModal,
    payload: confirmation
  });
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
