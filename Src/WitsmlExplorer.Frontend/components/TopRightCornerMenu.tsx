import { Button, Menu, Typography } from "@equinor/eds-core-react";
import React, { MouseEvent, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import OperationContext from "../contexts/operationContext";
import { UserTheme } from "../contexts/operationStateReducer";
import OperationType from "../contexts/operationType";
import { getAccountInfo, msalEnabled, signOut } from "../msal/MsalAuthProvider";
import Icon from "../styles/Icons";
import JobsButton from "./JobsButton";

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

  const onToggleThemeMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorThemeEl(openTheme ? null : event.currentTarget);
    setAnchorAccountEl(null);
  };

  const onToggleAccountMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorThemeEl(null);
    setAnchorAccountEl(openAccount ? null : event.currentTarget);
  };

  const onSelectTheme = (selectedTheme: UserTheme) => {
    localStorage.setItem("selectedTheme", selectedTheme);
    dispatchOperation({ type: OperationType.SetTheme, payload: selectedTheme });
    setAnchorThemeEl(null);
  };

  return (
    <Layout>
      <JobsButton />
      <Button variant="ghost" onClick={(event) => onToggleThemeMenu(event)}>
        <Icon name="accessible" />
        Theme
      </Button>
      <Menu id="ThemeMenu" anchorEl={anchorThemeEl} open={openTheme}>
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
          <Button variant="ghost" onClick={(event) => onToggleAccountMenu(event)}>
            <Icon name="accountCircle" />
            Account
          </Button>
          <Menu id="AccountMenu" anchorEl={anchorAccountEl} open={openAccount}>
            <StyledMenuItem key={"account"}>{getAccountInfo()?.name}</StyledMenuItem>
            <StyledMenuItem key={"signout"} onClick={() => signOut()}>
              Logout
            </StyledMenuItem>
          </Menu>
        </>
      )}
    </Layout>
  );
};

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-right: 1rem;
  width: 20rem;
`;

const SelectTypography = styled(Typography) <{ selected: boolean }>`
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

export default TopRightCornerMenu;
