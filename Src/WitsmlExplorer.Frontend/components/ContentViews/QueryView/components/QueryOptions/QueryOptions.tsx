import React, { ChangeEvent, FC, useContext, useState } from "react";
import { Box, Stack } from "@mui/material";
import { StyledNativeSelect } from "../../../../Select.tsx";
import {
  formatXml,
  getParserError,
  ReturnElements,
  StoreFunction
} from "../../../QueryViewUtils.tsx";
import TemplatePicker from "./TemplatePicker";
import {
  QueryActionType,
  QueryContext
} from "../../../../../contexts/queryContext.tsx";
import styled, { css } from "styled-components";
import { TextField } from "@equinor/eds-core-react";
import { Colors } from "../../../../../styles/Colors.tsx";
import { useOperationState } from "../../../../../hooks/useOperationState.tsx";
import { Button } from "../../../../StyledComponents/Button.tsx";
import Icon from "../../../../../styles/Icons.tsx";
import { DispatchOperation } from "../../../../../contexts/operationStateReducer.tsx";
import OperationType from "../../../../../contexts/operationType.ts";
import QueryService from "../../../../../services/queryService.ts";
import ConfirmModal from "../../../../Modals/ConfirmModal.tsx";

type QueryOptionsProps = {
  onQueryChange: (newValue: string) => void;
};

const QueryOptions: FC<QueryOptionsProps> = ({ onQueryChange }) => {
  const {
    dispatchQuery,
    queryState: { queries, tabIndex }
  } = useContext(QueryContext);
  const {
    operationState: { colors },
    dispatchOperation
  } = useOperationState();

  const [isLoading, setIsLoading] = useState(false);

  const { storeFunction, returnElements, optionsIn, query } = queries[tabIndex];

  const onFunctionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatchQuery({
      type: QueryActionType.SetStoreFunction,
      storeFunction: event.target.value as StoreFunction
    });
  };

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

  return (
    <Box>
      <Stack
        justifyContent="space-between"
        direction="row"
        gap="1rem"
        alignItems="end"
      >
        <Box flexBasis="100%">
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
        </Box>
        <Stack
          flexBasis="100%"
          justifyContent="flex-end"
          gap="0.5rem"
          direction="row"
        >
          <TemplatePicker
            dispatchQuery={dispatchQuery}
            returnElements={returnElements}
          />
          <Button onClick={sendQuery} disabled={isLoading}>
            <Icon name="play" />
            Execute
          </Button>
        </Stack>
      </Stack>

      {storeFunction === StoreFunction.GetFromStore && (
        <Box height="fit-content" pt="1rem">
          <Box component="details" open>
            <StyledSummary
              component="summary"
              sx={{ cursor: "pointer", width: "fit-content" }}
              colors={colors}
            >
              More options
            </StyledSummary>
            <Stack direction="row" alignItems="flex-end" gap="1rem" pt="1rem">
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
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
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

const StyledTextField = styled(TextField)<{ colors: Colors }>`
  label {
    color: ${(props) => props.colors.text.staticIconsDefault};
  }

  div {
    background: ${(props) => props.colors.text.staticTextFieldDefault};
  }
`;

const StyledSummary = styled(Box)<{ colors: Colors }>`
  ${({ colors }) => css`
    color: ${colors.interactive.primaryResting};
  `}
`;

export default QueryOptions;
