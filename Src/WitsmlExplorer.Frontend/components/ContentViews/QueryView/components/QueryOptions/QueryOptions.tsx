import React, { ChangeEvent, FC, useContext } from "react";
import { Box, Stack } from "@mui/material";
import { StyledNativeSelect } from "../../../../Select.tsx";
import { ReturnElements, StoreFunction } from "../../../QueryViewUtils.tsx";
import TemplatePicker from "./TemplatePicker";
import {
  QueryActionType,
  QueryContext
} from "../../../../../contexts/queryContext.tsx";
import styled, { css } from "styled-components";
import { TextField } from "@equinor/eds-core-react";
import { Colors } from "../../../../../styles/Colors.tsx";
import { useOperationState } from "../../../../../hooks/useOperationState.tsx";

const QueryOptions: FC = () => {
  const {
    dispatchQuery,
    queryState: { queries, tabIndex }
  } = useContext(QueryContext);
  const {
    operationState: { colors }
  } = useOperationState();

  const { storeFunction, returnElements, optionsIn } = queries[tabIndex];

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
        <Box flexBasis="100%" textAlign="right">
          <TemplatePicker
            dispatchQuery={dispatchQuery}
            returnElements={returnElements}
          />
        </Box>
      </Stack>

      {storeFunction === StoreFunction.GetFromStore && (
        <Box height="fit-content" pt="1rem">
          <Box component="details" open>
            <StyledSummary
              component="summary"
              sx={{ cursor: "pointer" }}
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
