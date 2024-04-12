import { DotProgress } from "@equinor/eds-core-react";
import { Tooltip } from "@mui/material";
import { TreeItem, TreeItemProps } from "@mui/x-tree-view";
import OperationContext from "contexts/operationContext";
import { UserTheme } from "contexts/operationStateReducer";
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

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
  } = useContext(OperationContext);
  const isCompactMode = theme === UserTheme.Compact;

  const {
    operationState: { colors }
  } = useContext(OperationContext);

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
  top: 0.75rem;
  position: relative;
`;

export default StyledTreeItem;
