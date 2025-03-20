import { Radio, TextField, Tooltip, Typography } from "@equinor/eds-core-react";
import { getOffsetFromTimeZone } from "components/DateFormatter";
import ModalDialog from "components/Modals/ModalDialog";
import { StyledNativeSelect } from "components/Select";
import { Button } from "components/StyledComponents/Button";
import { Checkbox } from "components/StyledComponents/Checkbox";
import {
  DateTimeFormat,
  DecimalPreference,
  TimeZone,
  UserTheme
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { getAccountInfo, msalEnabled, signOut } from "msal/MsalAuthProvider";
import React, { ChangeEvent, CSSProperties, FC, useState } from "react";
import AuthorizationService from "services/authorizationService";
import styled from "styled-components";
import { dark, light } from "styles/Colors";
import Icon from "styles/Icons";
import {
  setLocalStorageItem,
  STORAGE_DATETIMEFORMAT_KEY,
  STORAGE_DECIMAL_KEY,
  STORAGE_HOTKEYS_ENABLED_KEY,
  STORAGE_MODE_KEY,
  STORAGE_THEME_KEY,
  STORAGE_TIMEZONE_KEY
} from "tools/localStorageHelpers";

const iconSizes: { [key in UserTheme]: 24 | 32 | 16 | 18 | 40 } = {
  [UserTheme.Compact]: 24,
  [UserTheme.SemiCompact]: 32,
  [UserTheme.Comfortable]: 32
};

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
  } = useOperationState();
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
            <RowIcon name="accessible" />
            <StyledNativeSelect
              label="Theme"
              id="native-select-theme"
              onChange={onChangeTheme}
              defaultValue={theme}
              colors={colors}
            >
              <option value={UserTheme.Comfortable}>Comfortable</option>
              <option value={UserTheme.SemiCompact}>Semi-compact</option>
              <option value={UserTheme.Compact}>Compact</option>
            </StyledNativeSelect>
          </HorizontalLayout>
          <HorizontalLayout>
            <RowIcon name="inProgress" />
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
            <RowIcon name="world" />
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
            <RowIcon name="calendar" />
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
              <RowIcon name="edit" />
              <div style={alignLayout}>
                <label style={alignLayout}>Decimal precision:</label>
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
                  Custom
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
            <RowIcon style={{ alignSelf: "center" }} name="keyboard" />
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

type RowIconType = { name: string; style?: CSSProperties };

const RowIcon: FC<RowIconType> = ({ style, name }) => {
  const {
    operationState: { theme, colors }
  } = useOperationState();

  return (
    <Icon
      name={name}
      style={{ marginRight: "0.4rem", ...style }}
      size={iconSizes[theme]}
      color={colors.infographic.primaryMossGreen}
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
  alignItems: "center",
  whiteSpace: "nowrap"
};

export { SettingsModal };
