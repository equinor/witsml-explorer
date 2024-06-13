import { Menu, Tabs, TextField } from "@equinor/eds-core-react";
import {
  ReturnElements,
  StoreFunction,
  TemplateObjects,
  formatXml,
  getParserError,
  getQueryTemplate
} from "components/ContentViews/QueryViewUtils";
import ConfirmModal from "components/Modals/ConfirmModal";
import { QueryEditor } from "components/QueryEditor";
import { getTag } from "components/QueryEditorUtils";
import { StyledNativeSelect } from "components/Select";
import { Button } from "components/StyledComponents/Button";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { QueryActionType, QueryContext } from "contexts/queryContext";
import { useOperationState } from "hooks/useOperationState";
import React, { ChangeEvent, useContext, useState } from "react";
import QueryService from "services/queryService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

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
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);
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
        storeFunction === StoreFunction.GetFromStore
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

  const onFunctionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatchQuery({
      type: QueryActionType.SetStoreFunction,
      storeFunction: event.target.value as StoreFunction
    });
  };

  const onReturnElementsChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatchQuery({
      type: QueryActionType.SetReturnElements,
      returnElements: event.target.value as ReturnElements
    });
  };

  const onOptionsInChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    dispatchQuery({
      type: QueryActionType.SetOptionsIn,
      optionsIn: event.target.value
    });
  };

  const onTemplateSelect = (templateObject: TemplateObjects) => {
    const template = getQueryTemplate(templateObject, returnElements);
    if (template != undefined) {
      dispatchQuery({ type: QueryActionType.SetQuery, query: template });
    }
    setIsTemplateMenuOpen(false);
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          height: "100%",
          padding: "1rem"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateRows: "1fr auto",
            gap: "1rem",
            height: "100%"
          }}
        >
          <QueryEditor value={query} onChange={onQueryChange} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}>
            <StyledNativeSelect
              label="Function"
              id="function"
              onChange={onFunctionChange}
              value={storeFunction}
              colors={colors}
            >
              {Object.values(StoreFunction).map((value) => {
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </StyledNativeSelect>
            <StyledNativeSelect
              label="Return elements"
              id="return-elements"
              onChange={onReturnElementsChange}
              value={returnElements}
              colors={colors}
            >
              {Object.values(ReturnElements).map((value) => {
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </StyledNativeSelect>
            <StyledTextField
              id="optionsIn"
              label="Options In"
              value={optionsIn}
              onChange={onOptionsInChange}
              colors={colors}
            />
            <Button
              ref={setMenuAnchor}
              id="anchor-default"
              aria-haspopup="true"
              aria-expanded={isTemplateMenuOpen}
              aria-controls="menu-default"
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            >
              Template
              <Icon name="chevronUp" />
            </Button>
            <StyledMenu
              open={isTemplateMenuOpen}
              id="menu-default"
              aria-labelledby="anchor-default"
              onClose={() => setIsTemplateMenuOpen(false)}
              anchorEl={menuAnchor}
              colors={colors}
            >
              {Object.values(TemplateObjects).map((value) => {
                return (
                  <StyledMenuItem
                    colors={colors}
                    key={value}
                    onClick={() => onTemplateSelect(value)}
                  >
                    {value}
                  </StyledMenuItem>
                );
              })}
            </StyledMenu>
            <Button onClick={sendQuery} disabled={isLoading}>
              Execute
            </Button>
          </div>
        </div>
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

const StyledMenu = styled(Menu)<{ colors: Colors }>`
  background: ${(props) => props.colors.ui.backgroundLight};
  padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  max-height: 80vh;
  overflow-y: scroll;
`;

const StyledMenuItem = styled(Menu.Item)<{ colors: Colors }>`
  &&:hover {
    background-color: ${(props) =>
      props.colors.interactive.contextMenuItemHover};
  }
  color: ${(props) => props.colors.text.staticIconsDefault};
  padding: 4px;
`;

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  label {
    color: ${(props) => props.colors.text.staticIconsDefault};
  }
  div {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
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
