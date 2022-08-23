import { Menu, Typography } from "@equinor/eds-core-react";
import React, { MouseEvent, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import OperationContext from "../contexts/operationContext";
import { UserTheme } from "../contexts/operationStateReducer";
import OperationType from "../contexts/operationType";
import { getAccountInfo, msalEnabled, signOut } from "../msal/MsalAuthProvider";
import { colors } from "../styles/Colors";
import Icon from "../styles/Icons";

const TopRightCornerMenu = (): React.ReactElement => {
  const {
    operationState: { theme },
    dispatchOperation
  } = useContext(OperationContext);
  const [anchorThemeEl, setAnchorThemeEl] = useState(null);
  const [anchorAccountEl, setAnchorAccountEl] = useState(null);
  const openTheme = Boolean(anchorThemeEl);
  const openAccount = Boolean(anchorAccountEl);

  useEffect(() => {
    let localStorageTheme;
    if (typeof localStorage != "undefined") {
      localStorageTheme = (localStorage.getItem("selectedTheme") as UserTheme) ?? theme;
      dispatchOperation({ type: OperationType.SetTheme, payload: localStorageTheme });
    }
  }, []);

  const onToggleThemeMenu = (event: MouseEvent<SVGSVGElement>) => {
    setAnchorThemeEl(openTheme ? null : event.currentTarget);
    setAnchorAccountEl(null);
  };

  const onToggleAccountMenu = (event: MouseEvent<SVGSVGElement>) => {
    setAnchorThemeEl(null);
    setAnchorAccountEl(openAccount ? null : event.currentTarget);
  };

  const onSelectTheme = (selectedTheme: UserTheme) => {
    localStorage.setItem("selectedTheme", selectedTheme);
    dispatchOperation({ type: OperationType.SetTheme, payload: selectedTheme });
    setAnchorThemeEl(null);
  };

  return (
    <>
      <Pointer>
        <Icon name="moreVertical" onClick={(event: MouseEvent<SVGSVGElement>) => onToggleThemeMenu(event)} size={24} color={colors.interactive.primaryResting} />
      </Pointer>
      <Menu id="ThemeMenu" anchorEl={anchorThemeEl} open={openTheme}>
        <MenuLabel key={"text"}>Theme</MenuLabel>
        <StyledMenuItem key={"comfortable"} onClick={() => onSelectTheme(UserTheme.Comfortable)}>
          <SelectTypography selected={theme === UserTheme.Comfortable}>Comfortable </SelectTypography>
          {theme === UserTheme.Comfortable && <Icon name="check" />}
        </StyledMenuItem>
        <StyledMenuItem key={"compact"} onClick={() => onSelectTheme(UserTheme.Compact)}>
          <SelectTypography selected={theme === UserTheme.Compact}>Compact</SelectTypography>
          {theme === UserTheme.Compact && <Icon name="check" />}
        </StyledMenuItem>
      </Menu>
      {msalEnabled && (
        <>
          <Pointer>
            <Icon name="accessible" onClick={(event: MouseEvent<SVGSVGElement>) => onToggleAccountMenu(event)} size={24} color={colors.interactive.primaryResting} />
          </Pointer>
          <Menu id="AccountMenu" anchorEl={anchorAccountEl} open={openAccount}>
            <MenuLabel key={"text"}>Account</MenuLabel>
            <StyledMenuItem key={"account"}>{getAccountInfo()?.name}</StyledMenuItem>
            <StyledMenuItem key={"signout"} onClick={() => signOut()}>
              Logout
            </StyledMenuItem>
          </Menu>
        </>
      )}
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

const MenuLabel = styled.p`
  font-family: inherit;
  font-size: 0.75rem;
  margin: 0.5rem 1.5rem 0.5rem 1.5rem;
`;

const Pointer = styled.div`
  cursor: pointer;
`;

export default TopRightCornerMenu;
