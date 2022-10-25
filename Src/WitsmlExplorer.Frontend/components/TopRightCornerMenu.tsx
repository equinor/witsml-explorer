import { Button, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { ReactElement, useContext, useEffect } from "react";
import styled from "styled-components";
import OperationContext from "../contexts/operationContext";
import { UserTheme } from "../contexts/operationStateReducer";
import OperationType from "../contexts/operationType";
import { getAccountInfo, msalEnabled, signOut } from "../msal/MsalAuthProvider";
import CredentialsService from "../services/credentialsService";
import Icon from "../styles/Icons";
import ContextMenu from "./ContextMenus/ContextMenu";
import JobsButton from "./JobsButton";

const TopRightCornerMenu = (): React.ReactElement => {
  const {
    operationState: { theme },
    dispatchOperation
  } = useContext(OperationContext);

  useEffect(() => {
    let localStorageTheme;
    if (typeof localStorage != "undefined") {
      localStorageTheme = (localStorage.getItem("selectedTheme") as UserTheme) ?? theme;
      dispatchOperation({ type: OperationType.SetTheme, payload: localStorageTheme });
    }
  }, []);

  const onSelectTheme = (selectedTheme: UserTheme) => {
    localStorage.setItem("selectedTheme", selectedTheme);
    dispatchOperation({ type: OperationType.SetTheme, payload: selectedTheme });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const themeMenu = (
    <ContextMenu
      menuItems={[
        <StyledMenuItem key={"comfortable"} onClick={() => onSelectTheme(UserTheme.Comfortable)}>
          <SelectTypography selected={theme === UserTheme.Comfortable}>Comfortable </SelectTypography>
          {theme === UserTheme.Comfortable && <Icon name="check" />}
        </StyledMenuItem>,
        <StyledMenuItem key={"compact"} onClick={() => onSelectTheme(UserTheme.Compact)}>
          <SelectTypography selected={theme === UserTheme.Compact}>Compact</SelectTypography>
          {theme === UserTheme.Compact && <Icon name="check" />}
        </StyledMenuItem>
      ]}
    />
  );

  const accountMenu = (
    <ContextMenu
      menuItems={[
        <StyledMenuItem key={"account"}>{getAccountInfo()?.name}</StyledMenuItem>,
        <StyledMenuItem
          key={"signout"}
          onClick={() => {
            const logout = async () => {
              await CredentialsService.deauthorize();
              signOut();
            };
            logout();
            dispatchOperation({ type: OperationType.HideContextMenu });
          }}
        >
          Logout
        </StyledMenuItem>
      ]}
    />
  );

  const onOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, menu: ReactElement) => {
    const position = { mouseX: event.currentTarget.getBoundingClientRect().left, mouseY: event.currentTarget.getBoundingClientRect().bottom };
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: menu, position } });
  };

  return (
    <Layout>
      <JobsButton />
      <Button variant="ghost" onClick={(event) => onOpenMenu(event, themeMenu)}>
        <Icon name="accessible" />
        Theme
      </Button>
      {msalEnabled && (
        <Button variant="ghost" onClick={(event) => onOpenMenu(event, accountMenu)}>
          <Icon name="accountCircle" />
          Account
        </Button>
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

const SelectTypography = styled(Typography)<{ selected: boolean }>`
  && {
    font-family: ${(props) => (props.selected ? "EquinorBold" : "EquinorRegular")};
  }
`;

const StyledMenuItem = styled(MenuItem)`
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
