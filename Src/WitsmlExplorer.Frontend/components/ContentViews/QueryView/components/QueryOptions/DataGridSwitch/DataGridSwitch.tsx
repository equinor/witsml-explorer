import React, { ChangeEventHandler, FC } from "react";
import { Stack } from "@mui/material";
import { Switch } from "@equinor/eds-core-react";
import { useOperationState } from "../../../../../../hooks/useOperationState.tsx";
import { UserTheme } from "../../../../../../contexts/operationStateReducer.tsx";

type DataGridSwitchProps = {
  onClick: ChangeEventHandler<HTMLInputElement>;
  dataGridActive: boolean;
};

const DataGridSwitch: FC<DataGridSwitchProps> = ({
  onClick,
  dataGridActive
}) => {
  const isCompact =
    useOperationState().operationState.theme === UserTheme.Compact;

  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-start">
      <Switch
        checked={dataGridActive}
        onChange={onClick}
        size={isCompact ? "small" : "default"}
        label="Use data grid view"
      />
    </Stack>
  );
};

export default DataGridSwitch;
