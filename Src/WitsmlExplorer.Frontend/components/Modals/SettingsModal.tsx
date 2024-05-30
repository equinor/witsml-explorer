import { Radio, TextField, Tooltip, Typography } from "@equinor/eds-core-react";
import { getOffsetFromTimeZone } from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import { StyledNativeSelect } from "components/Select";
import { Button } from "components/StyledComponents/Button";
import { Checkbox } from "components/StyledComponents/Checkbox";
import OperationContext from "contexts/operationContext";
import {
  DateTimeFormat,
  DecimalPreference,
  TimeZone,
  UserTheme
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { getAccountInfo, msalEnabled, signOut } from "msal/MsalAuthProvider";
import React, { CSSProperties, ChangeEvent, useContext, useState } from "react";
import AuthorizationService from "services/authorizationService";
import styled from "styled-components";
import { dark, light } from "styles/Colors";
import Icon from "styles/Icons";
import {
  STORAGE_DATETIMEFORMAT_KEY,
  STORAGE_DECIMAL_KEY,
  STORAGE_HOTKEYS_ENABLED_KEY,
  STORAGE_MODE_KEY,
  STORAGE_THEME_KEY,
  STORAGE_TIMEZONE_KEY,
  setLocalStorageItem
} from "tools/localStorageHelpers";

const timeZoneLabels: Record<TimeZone, string> = {
  [TimeZone.Local]: `${getOffsetFromTimeZone(TimeZone.Local)} Local Time`,
  [TimeZone.Raw]: "Original Time",
  [TimeZone.Utc]: `${getOffsetFromTimeZone(TimeZone.Utc)} UTC`,
  [TimeZone.Brasilia]: `${getOffsetFromTimeZone(
    TimeZone.Brasilia
  )} Brazil/Brasilia`,
  [TimeZone.Berlin]: `${getOffsetFromTimeZone(TimeZone.Berlin)} Europe/Berlin`,
  [TimeZone.London]: `${getOffsetFromTimeZone(TimeZone.London)} Europe/London`,
  [TimeZone.NewDelhi]: `${getOffsetFromTimeZone(
    TimeZone.NewDelhi
  )} India/New Delhi`,
  [TimeZone.Houston]: `${getOffsetFromTimeZone(TimeZone.Houston)} US/Houston`
};

const SettingsModal = (): React.ReactElement => {
  const {
    operationState: {
      theme,
      timeZone,
      colors,
      dateTimeFormat,
      decimals,
      hotKeysEnabled
    },
    dispatchOperation
  } = useContext(OperationContext);
  const [checkedDecimalPreference, setCheckedDecimalPreference] =
    useState<string>(() => {
      return decimals === DecimalPreference.Raw
        ? DecimalPreference.Raw
        : DecimalPreference.Decimal;
    });
  const [decimalError, setDecimalError] = useState<boolean>(false);

  const onChangeTheme = (event: any) => {
    const selectedTheme = event.target.value;
    setLocalStorageItem<UserTheme>(STORAGE_THEME_KEY, selectedTheme);
    dispatchOperation({ type: OperationType.SetTheme, payload: selectedTheme });
  };
  const onChangeMode = (event: any) => {
    let selectedMode;
    if (event.target.value == "light") {
      selectedMode = light;
    } else {
      selectedMode = dark;
    }
    setLocalStorageItem<"light" | "dark">(STORAGE_MODE_KEY, event.target.value);
    dispatchOperation({ type: OperationType.SetMode, payload: selectedMode });
  };

  const onChangeDateTimeFormat = (event: any) => {
    const selectedDateTimeFormat = event.target.value;
    setLocalStorageItem<DateTimeFormat>(
      STORAGE_DATETIMEFORMAT_KEY,
      selectedDateTimeFormat
    );
    dispatchOperation({
      type: OperationType.SetDateTimeFormat,
      payload: selectedDateTimeFormat
    });
  };

  const onChangeTimeZone = (event: any) => {
    const selectedTimeZone = event.target.value;
    setLocalStorageItem<TimeZone>(STORAGE_TIMEZONE_KEY, selectedTimeZone);
    dispatchOperation({
      type: OperationType.SetTimeZone,
      payload: selectedTimeZone
    });
  };

  const onChangeDecimals = (event: any) => {
    const inputDecimals: any = parseInt(event.target.value, 10);
    if (!isNaN(inputDecimals) && inputDecimals >= 0 && inputDecimals <= 10) {
      setDecimalError(false);
      setLocalStorageItem<DecimalPreference>(
        STORAGE_DECIMAL_KEY,
        inputDecimals
      );
      dispatchOperation({
        type: OperationType.SetDecimal,
        payload: inputDecimals
      });
    } else {
      setDecimalError(true);
    }
  };

  const onChangeDecimalPreference = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    if (event.target.value === DecimalPreference.Raw) {
      setLocalStorageItem<DecimalPreference>(
        STORAGE_DECIMAL_KEY,
        DecimalPreference.Raw
      );
      dispatchOperation({
        type: OperationType.SetDecimal,
        payload: DecimalPreference.Raw as DecimalPreference
      });
    }
    setCheckedDecimalPreference(selectedValue);
  };

  const onChangeHotKeysEnabled = (event: ChangeEvent<HTMLInputElement>) => {
    const hotKeysEnabled = event.target.checked;
    setLocalStorageItem<boolean>(STORAGE_HOTKEYS_ENABLED_KEY, hotKeysEnabled);
    dispatchOperation({
      type: OperationType.SetHotKeysEnabled,
      payload: hotKeysEnabled
    });
  };

  return (
    <ModalDialog
      heading="Settings"
      content={
        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <HorizontalLayout>
            <Icon
              name="accessible"
              size={32}
              color={colors.infographic.primaryMossGreen}
            />
            <StyledNativeSelect
              label="Theme"
              id="native-select-theme"
              onChange={onChangeTheme}
              defaultValue={theme}
              colors={colors}
            >
              <option value={UserTheme.Comfortable}>Comfortable</option>
              <option value={UserTheme.Compact}>Compact</option>
            </StyledNativeSelect>
          </HorizontalLayout>
          <HorizontalLayout>
            <Icon
              name="inProgress"
              size={32}
              color={colors.infographic.primaryMossGreen}
            />
            <StyledNativeSelect
              id={"native-select-mode"}
              label={"Mode"}
              onChange={onChangeMode}
              defaultValue={colors === light ? "light" : "dark"}
              colors={colors}
            >
              <option value={"light"}>Light Mode</option>
              <option value={"dark"}>Dark Mode</option>
            </StyledNativeSelect>
          </HorizontalLayout>
          <HorizontalLayout>
            <Icon
              name="world"
              size={32}
              color={colors.infographic.primaryMossGreen}
            />
            <StyledNativeSelect
              label="Time Zone"
              id="native-select-timezone"
              onChange={onChangeTimeZone}
              defaultValue={timeZone}
              colors={colors}
            >
              {Object.entries(timeZoneLabels).map(
                ([timeZoneKey, timeZoneLabel]) => (
                  <option key={timeZoneKey} value={timeZoneKey}>
                    {timeZoneLabel}
                  </option>
                )
              )}
            </StyledNativeSelect>
          </HorizontalLayout>
          <HorizontalLayout>
            <Icon
              name="calendar"
              size={32}
              color={colors.infographic.primaryMossGreen}
            />
            <StyledNativeSelect
              label="Datetime Format"
              id="native-select-datetimeformat"
              onChange={onChangeDateTimeFormat}
              defaultValue={dateTimeFormat}
              colors={colors}
            >
              <option value={DateTimeFormat.Raw}>Raw</option>
              <option value={DateTimeFormat.Natural}>
                dd.MM.yyyy HH:mm:ss.SSS
              </option>
            </StyledNativeSelect>
          </HorizontalLayout>
          <HorizontalLayout>
            <div style={alignLayout}>
              <Icon
                name="edit"
                size={32}
                color={colors.infographic.primaryMossGreen}
              />
              <div style={alignLayout}>
                <label style={alignLayout}>
                  <Radio
                    name="group"
                    value={DecimalPreference.Raw}
                    checked={checkedDecimalPreference === DecimalPreference.Raw}
                    onChange={onChangeDecimalPreference}
                  />
                  Raw
                </label>
                <label style={alignLayout}>
                  <Radio
                    name="group"
                    value={DecimalPreference.Decimal}
                    checked={
                      checkedDecimalPreference === DecimalPreference.Decimal
                    }
                    onChange={onChangeDecimalPreference}
                  />
                  Decimals
                </label>
                {checkedDecimalPreference === DecimalPreference.Decimal && (
                  <TextField
                    variant={decimalError ? "error" : null}
                    helperText={
                      decimalError
                        ? "Must be a positive integer between 0 and 10"
                        : ""
                    }
                    id="decimal"
                    onChange={onChangeDecimals}
                    type="number"
                    defaultValue={decimals}
                    style={{ paddingLeft: "1rem" }}
                  />
                )}
              </div>
            </div>
          </HorizontalLayout>
          <HorizontalLayout>
            <Icon
              style={{ alignSelf: "center" }}
              name="keyboard"
              size={32}
              color={colors.infographic.primaryMossGreen}
            />
            <Checkbox
              color={"primary"}
              checked={hotKeysEnabled}
              onChange={onChangeHotKeysEnabled}
              label={"Enable HotKeys"}
              colors={colors}
            />
            <Tooltip title="Alt+D or Alt+T: Navigate to Depth or Time logs.">
              <Icon
                style={{ alignSelf: "center", marginLeft: "8px" }}
                name="infoCircle"
                color={colors.interactive.primaryResting}
                size={18}
              />
            </Tooltip>
          </HorizontalLayout>
          {msalEnabled && (
            <HorizontalLayout>
              <Typography style={{ margin: "auto 1rem auto 0" }}>
                Logged in to Azure AD as {getAccountInfo()?.name}
              </Typography>
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

const alignLayout: CSSProperties = {
  display: "flex",
  alignItems: "center"
};

export { SettingsModal };
