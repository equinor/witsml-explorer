import { Button, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { ReactElement, useContext, useEffect } from "react";
import styled from "styled-components";
import OperationContext from "../contexts/operationContext";
import { TimeZone, UserTheme } from "../contexts/operationStateReducer";
import OperationType from "../contexts/operationType";
import { getAccountInfo, msalEnabled, signOut } from "../msal/MsalAuthProvider";
import CredentialsService from "../services/credentialsService";
import Icon from "../styles/Icons";
import ContextMenu from "./ContextMenus/ContextMenu";
import { getOffsetFromTimeZone } from "./DateFormatter";
import JobsButton from "./JobsButton";

const timeZoneLabels: Record<TimeZone, string> = {
  [TimeZone.Raw]: "Original Time",
  [TimeZone.Local]: `${getOffsetFromTimeZone(TimeZone.Local)} Local Time`,
  [TimeZone.Utc]: `${getOffsetFromTimeZone(TimeZone.Utc)} UTC`,
  [TimeZone.Brasilia]: `${getOffsetFromTimeZone(TimeZone.Brasilia)} Brazil/Brasilia`,
  [TimeZone.Berlin]: `${getOffsetFromTimeZone(TimeZone.Berlin)} Europe/Berlin`,
  [TimeZone.London]: `${getOffsetFromTimeZone(TimeZone.London)} Europe/London`,
  [TimeZone.NewDelhi]: `${getOffsetFromTimeZone(TimeZone.NewDelhi)} India/New Delhi`,
  [TimeZone.Houston]: `${getOffsetFromTimeZone(TimeZone.Houston)} US/Houston`
};

const TopRightCornerMenu = (): React.ReactElement => {
  const {
    operationState: { theme, timeZone },
    dispatchOperation
  } = useContext(OperationContext);

  useEffect(() => {
    let localStorageTheme;
    if (typeof localStorage != "undefined") {
      localStorageTheme = (localStorage.getItem("selectedTheme") as UserTheme) ?? theme;
      dispatchOperation({ type: OperationType.SetTheme, payload: localStorageTheme });
      const storedTimeZone = (localStorage.getItem("selectedTimeZone") as TimeZone) ?? timeZone;
      dispatchOperation({ type: OperationType.SetTimeZone, payload: storedTimeZone });
    }
  }, []);

  const onSelectTimeZone = (selectedTimeZone: TimeZone) => {
    localStorage.setItem("selectedTimeZone", selectedTimeZone);
    dispatchOperation({ type: OperationType.SetTimeZone, payload: selectedTimeZone });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const timeZoneMenuItems = [];
  for (const key in timeZoneLabels) {
    timeZoneMenuItems.push(
      <StyledMenuItem key={key} onClick={() => onSelectTimeZone(key as TimeZone)}>
        <TimeZoneTypography selected={timeZone === (key as TimeZone)}>{timeZoneLabels[key as TimeZone]}</TimeZoneTypography>
        {timeZone === key && <Icon name="check" />}
      </StyledMenuItem>
    );
  }
  const timeZoneMenu = <ContextMenu menuItems={timeZoneMenuItems} />;

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
      <StyledButton variant="ghost" onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onOpenMenu(event, timeZoneMenu)}>
        <Icon name="world" />
        {timeZoneLabels[timeZone]}
      </StyledButton>
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

const StyledButton = styled(Button)`
  white-space: nowrap;
`;

const SelectTypography = styled(Typography)<{ selected: boolean }>`
  && {
    font-family: ${(props) => (props.selected ? "EquinorBold" : "EquinorRegular")};
    white-space: nowrap;
  }
`;

const TimeZoneTypography = styled(SelectTypography)<{ selected: boolean }>`
  && {
    font-feature-settings: "tnum";
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
