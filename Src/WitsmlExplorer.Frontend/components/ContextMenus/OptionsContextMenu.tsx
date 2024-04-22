import { Icon, Typography } from "@equinor/eds-core-react";
import { MenuItem, Tooltip } from "@mui/material";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import { HideModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import React, { useMemo } from "react";
import styled from "styled-components";
import { colors } from "styles/Colors";
import { TooltipLayout } from "../StyledComponents/Tooltip";

export interface OptionsContextMenuProps {
  dispatchOperation: (action: HideModalAction) => void;
  options: string[];
  getOptionInformation?: (option: string) => string | null;
  onOptionChange: (newValue: string) => void;
}

const OptionsContextMenu = (
  props: OptionsContextMenuProps
): React.ReactElement => {
  const { dispatchOperation, options, onOptionChange, getOptionInformation } =
    props;

  const handleOptionChange = (option: string) => {
    dispatchOperation({ type: OperationType.HideModal });
    onOptionChange(option);
  };

  const menuItems = useMemo(() => {
    return options.map((option) => (
      <MenuItem key={option} onClick={() => handleOptionChange(option)}>
        <OptionLayout>
          <Typography color={"primary"}>{pluralize(option)}</Typography>
          {getOptionInformation?.(option) && (
            <Tooltip
              title={
                <TooltipLayout>{getOptionInformation(option)}</TooltipLayout>
              }
            >
              <Icon
                name="infoCircle"
                color={colors.interactive.primaryResting}
                size={18}
                data-testid={`${option}-info-icon`}
              />
            </Tooltip>
          )}
        </OptionLayout>
      </MenuItem>
    ));
  }, [options, onOptionChange]);

  return <ContextMenu menuItems={menuItems} />;
};

const OptionLayout = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

export default OptionsContextMenu;
