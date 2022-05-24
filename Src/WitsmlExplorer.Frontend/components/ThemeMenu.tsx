import React, { MouseEvent, useContext, useEffect, useState } from "react";
import Icon from "../styles/Icons";
import { colors } from "../styles/Colors";
import OperationContext from "../contexts/operationContext";
import { UserTheme } from "../contexts/operationStateReducer";
import OperationType from "../contexts/operationType";
import { Menu, Typography } from "@equinor/eds-core-react";
import styled from "styled-components";

const ThemeMenu = (): React.ReactElement => {
  const {
    operationState: { theme },
    dispatchOperation
  } = useContext(OperationContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    let localStorageTheme;
    if (typeof localStorage != "undefined") {
      localStorageTheme = (localStorage.getItem("selectedTheme") as UserTheme) ?? theme;
      dispatchOperation({ type: OperationType.SetTheme, payload: localStorageTheme });
    }
  }, []);

  const onToggleMenu = (event: MouseEvent<SVGSVGElement>) => {
    anchorEl != null ? setAnchorEl(null) : setAnchorEl(event.currentTarget);
  };

  const onSelectTheme = (selectedTheme: UserTheme) => {
    localStorage.setItem("selectedTheme", selectedTheme);
    dispatchOperation({ type: OperationType.SetTheme, payload: selectedTheme });
    setAnchorEl(null);
  };

  return (
    <>
      <Pointer>
        <Icon name="accessible" onClick={(event: MouseEvent<SVGSVGElement>) => onToggleMenu(event)} size={24} color={colors.interactive.primaryResting} />
      </Pointer>
      <Menu id="ThemeMenu" anchorEl={anchorEl} open={open}>
        <ThemeLabel key={"text"}>Display density:</ThemeLabel>
        <StyledMenuItem key={"comfortable"} onClick={() => onSelectTheme(UserTheme.Comfortable)}>
          <SelectTypography selected={theme === UserTheme.Comfortable}>Comfortable </SelectTypography>
          {theme === UserTheme.Comfortable && <Icon name="check" />}
        </StyledMenuItem>
        <StyledMenuItem key={"compact"} onClick={() => onSelectTheme(UserTheme.Compact)}>
          <SelectTypography selected={theme === UserTheme.Compact}>Compact</SelectTypography>
          {theme === UserTheme.Compact && <Icon name="check" />}
        </StyledMenuItem>
      </Menu>
    </>
  );
};

const SelectTypography = styled(Typography)<{ selected: boolean }>`
  && {
    font-family: ${(props) => (props.selected ? "EquinorBold" : "EquinorRegular")};
  }
`;

const StyledMenuItem = styled(Menu.Item)`
  && {
    width: 13rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    &&:focus {
      outline: 0;
    }
  }
`;

const ThemeLabel = styled.p`
  font-family: inherit;
  font-size: 0.75rem;
  margin: 0.5rem 1.5rem 0.5rem 1.5rem;
`;

const Pointer = styled.div`
  cursor: pointer;
`;

export default ThemeMenu;
