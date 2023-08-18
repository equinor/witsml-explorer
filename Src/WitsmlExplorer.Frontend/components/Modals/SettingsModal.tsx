import { Button } from "@equinor/eds-core-react";
import { Typography } from "@material-ui/core";
import React, { useContext } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import { TimeZone, UserTheme } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { getAccountInfo, msalEnabled, signOut } from "../../msal/MsalAuthProvider";
import AuthorizationService from "../../services/authorizationService";
import { dark, light } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import { STORAGE_MODE_KEY, STORAGE_THEME_KEY, STORAGE_TIMEZONE_KEY } from "../Constants";
import { getOffsetFromTimeZone } from "../DateFormatter";
import { StyledNativeSelect } from "../Select";
import ModalDialog from "./ModalDialog";

const timeZoneLabels: Record<TimeZone, string> = {
  [TimeZone.Local]: `${getOffsetFromTimeZone(TimeZone.Local)} Local Time`,
  [TimeZone.Raw]: "Original Time",
  [TimeZone.Utc]: `${getOffsetFromTimeZone(TimeZone.Utc)} UTC`,
  [TimeZone.Brasilia]: `${getOffsetFromTimeZone(TimeZone.Brasilia)} Brazil/Brasilia`,
  [TimeZone.Berlin]: `${getOffsetFromTimeZone(TimeZone.Berlin)} Europe/Berlin`,
  [TimeZone.London]: `${getOffsetFromTimeZone(TimeZone.London)} Europe/London`,
  [TimeZone.NewDelhi]: `${getOffsetFromTimeZone(TimeZone.NewDelhi)} India/New Delhi`,
  [TimeZone.Houston]: `${getOffsetFromTimeZone(TimeZone.Houston)} US/Houston`
};

const SettingsModal = (): React.ReactElement => {
  const {
    operationState: { theme, timeZone, colors },
    dispatchOperation
  } = useContext(OperationContext);

  const onChangeTheme = (event: any) => {
    const selectedTheme = event.target.value;
    localStorage.setItem(STORAGE_THEME_KEY, selectedTheme);
    dispatchOperation({ type: OperationType.SetTheme, payload: selectedTheme });
  };
  const onChangeMode = (event: any) => {
    let selectedMode;
    if (event.target.value == "light") {
      selectedMode = light;
    } else {
      selectedMode = dark;
    }
    localStorage.setItem(STORAGE_MODE_KEY, event.target.value);
    dispatchOperation({ type: OperationType.SetMode, payload: selectedMode });
  };
  const onChangeTimeZone = (event: any) => {
    const selectedTimeZone = event.target.value;
    localStorage.setItem(STORAGE_TIMEZONE_KEY, selectedTimeZone);
    dispatchOperation({ type: OperationType.SetTimeZone, payload: selectedTimeZone });
  };

  return (
    <ModalDialog
      heading="Settings"
      content={
        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <HorizontalLayout>
            <Icon name="accessible" size={32} color={colors.infographic.primaryMossGreen} />
            <StyledNativeSelect label="Theme" id="native-select-theme" onChange={onChangeTheme} defaultValue={theme} colors={colors}>
              <option value={UserTheme.Comfortable}>Comfortable</option>
              <option value={UserTheme.Compact}>Compact</option>
            </StyledNativeSelect>
          </HorizontalLayout>
          <HorizontalLayout>
            <Icon name="inProgress" size={32} color={colors.infographic.primaryMossGreen} />
            <StyledNativeSelect id={"native-select-mode"} label={"Mode"} onChange={onChangeMode} defaultValue={colors === light ? "light" : "dark"} colors={colors}>
              <option value={"light"}>Light Mode</option>
              <option value={"dark"}>Dark Mode</option>
            </StyledNativeSelect>
          </HorizontalLayout>
          <HorizontalLayout>
            <Icon name="world" size={32} color={colors.infographic.primaryMossGreen} />
            <StyledNativeSelect label="Time Zone" id="native-select-timezone" onChange={onChangeTimeZone} defaultValue={timeZone} colors={colors}>
              {Object.entries(timeZoneLabels).map(([timeZoneKey, timeZoneLabel]) => (
                <option key={timeZoneKey} value={timeZoneKey}>
                  {timeZoneLabel}
                </option>
              ))}
            </StyledNativeSelect>
          </HorizontalLayout>
          {msalEnabled && (
            <HorizontalLayout>
              <Typography style={{ margin: "auto 1rem auto 0" }}>Logged in to Azure AD as {getAccountInfo()?.name}</Typography>
              <Button
                onClick={() => {
                  const logout = async () => {
                    await AuthorizationService.deauthorize();
                    signOut();
                  };
                  logout();
                }}
              >
                <Typography>Logout</Typography>
              </Button>
            </HorizontalLayout>
          )}
        </div>
      }
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      isLoading={false}
      showCancelButton={false}
      confirmText="Ok"
    />
  );
};

const HorizontalLayout = styled.div`
  && {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
  }
`;

export { SettingsModal };
