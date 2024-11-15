import React, { ChangeEventHandler, FC } from "react";
import { Stack } from "@mui/material";
import { Switch } from "@equinor/eds-core-react";
import { useOperationState } from "../../../../../../hooks/useOperationState.tsx";
import { UserTheme } from "../../../../../../contexts/operationStateReducer.tsx";
import styled from "styled-components";
import { Colors } from "../../../../../../styles/Colors.tsx";

type DataGridSwitchProps = {
  onClick: ChangeEventHandler<HTMLInputElement>;
  dataGridActive: boolean;
};

const DataGridSwitch: FC<DataGridSwitchProps> = ({
  onClick,
  dataGridActive
}) => {
  const { theme, colors } = useOperationState().operationState;
  const isCompact = theme === UserTheme.Compact;

  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-start">
      <StyledSwitch
        checked={dataGridActive}
        onChange={onClick}
        size={isCompact ? "small" : "default"}
        label="Use data grid view"
        colors={colors}
      />
    </Stack>
  );
};

const StyledSwitch = styled(Switch)<{ colors: Colors }>`
  & > span:nth-child(2) {
    color: ${({ colors }) => colors.interactive.primaryResting};
  }
`;

export default DataGridSwitch;
