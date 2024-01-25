import { DotProgress } from "@equinor/eds-core-react";
import { Tooltip } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { TreeItem } from "@material-ui/lab";
import { TreeItemProps } from "@material-ui/lab/TreeItem";
import { ToggleTreeNodeAction } from "contexts/navigationActions";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import React, { useContext } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

interface StyledTreeItemProps extends TreeItemProps {
  labelText: string;
  selected?: boolean;
  isActive?: boolean;
  isLoading?: boolean;
}

const StyledTreeItem = (props: StyledTreeItemProps): React.ReactElement => {
  const { labelText, selected, isActive, isLoading, ...other } = props; // eslint-disable-line
  const { dispatchNavigation } = useContext(NavigationContext);
  const isCompactMode = useTheme().props.MuiCheckbox.size === "small";

  const toggleTreeNode = (props: StyledTreeItemProps) => {
    const toggleTreeNode: ToggleTreeNodeAction = {
      type: NavigationType.ToggleTreeNode,
      payload: { nodeId: props.nodeId }
    };
    dispatchNavigation(toggleTreeNode);
  };
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  return (
    <TreeItem
      onIconClick={() => toggleTreeNode(props)}
      label={
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
