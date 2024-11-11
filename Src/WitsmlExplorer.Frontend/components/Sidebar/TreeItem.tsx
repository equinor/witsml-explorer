import { DotProgress } from "@equinor/eds-core-react";
import { Tooltip } from "@mui/material";
import { TreeItem, TreeItemProps } from "@mui/x-tree-view";
import { useOperationState } from "hooks/useOperationState";
import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";
import { isInAnyCompactMode } from "../../tools/themeHelpers.ts";

interface StyledTreeItemProps extends TreeItemProps {
  labelText: string;
  selected?: boolean;
  isActive?: boolean;
  isLoading?: boolean;
  to?: string;
}

const StyledTreeItem = (props: StyledTreeItemProps): React.ReactElement => {
  const { labelText, selected, isActive, isLoading, nodeId, to, ...other } =
    props;
  const {
    operationState: { theme }
  } = useOperationState();
  const isCompactMode = isInAnyCompactMode(theme);

  const {
    operationState: { colors }
  } = useOperationState();

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <NavLink to={to} style={{ textDecoration: "none" }}>
          <Label>
            <Tooltip
              title={labelText}
              arrow
              placement="top"
              disableHoverListener={labelText === "" || labelText == null}
              disableInteractive
            >
              <NavigationDrawer
                colors={colors}
                selected={selected}
                compactMode={isCompactMode}
              >
                {labelText}
              </NavigationDrawer>
            </Tooltip>
            {isLoading && <StyledDotProgress color={"primary"} size={32} />}
            {isActive && (
              <Icon
                size={16}
                name="beat"
                color={colors.interactive.successHover}
                style={{
                  position: "absolute",
                  right: "-20px",
                  top: isCompactMode ? "6px" : "14px"
                }}
              />
            )}
          </Label>
        </NavLink>
      }
      {...other}
    />
  );
};

const Label = styled.div`
  display: flex;
`;

const NavigationDrawer = styled.p<{
  selected: boolean;
  compactMode: boolean;
  colors: Colors;
}>`
  color: ${(props) =>
    props.selected
      ? props.colors.interactive.primaryResting
      : props.colors.text.staticIconsDefault};
  font-family: EquinorMedium, sans-serif;
  font-size: 0.75rem;
  line-height: 1rem;
  padding: ${(props) =>
    props.compactMode ? "0.5rem 0.5rem 0.5rem 0" : "1rem"};
  margin: 0;
`;

const StyledDotProgress = styled(DotProgress)`
  z-index: 2;
  align-self: center;
`;

export default StyledTreeItem;
