import {
  Autocomplete,
  EdsProvider,
  Radio,
  Typography
} from "@equinor/eds-core-react";
import ModalDialog from "components/Modals/ModalDialog";
import { Banner } from "components/StyledComponents/Banner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter.ts";
import { Server } from "models/server";
import { ChangeEvent, CSSProperties, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { checkIsUrlTooLong } from "routes/utils/checkIsUrlTooLong";
import { createLogCurveValuesSearchParams } from "routes/utils/createLogCurveValuesSearchParams";
import { getLogCurveValuesViewPath } from "routes/utils/pathBuilder";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";
import { openRouteInNewWindow } from "tools/windowHelpers";
import { normaliseThemeForEds } from "../../tools/themeHelpers.ts";

enum IndexRangeOptions {
  Full = "Full",
  Selected = "Selected"
}

enum MnemonicsOptions {
  All = "All",
  Selected = "Selected"
}

export function ShowLogDataOnServerModal() {
  const {
    operationState: { colors, theme },
    dispatchOperation
  } = useOperationState();
  const { wellUid, wellboreUid, objectGroup, objectUid, logType } = useParams();
  const [isUrlTooLong, setIsUrlTooLong] = useState(false);
  const [searchParams] = useSearchParams();
  const mnemonicsSearchParams = searchParams.get("mnemonics");
  const startIndex = searchParams.get("startIndex");
  const endIndex = searchParams.get("endIndex");
  const [indexRangeOption, setIndexRangeOption] = useState<IndexRangeOptions>(
    IndexRangeOptions.Full
  );
  const [mnemonicsOption, setMnemonicsOption] = useState<MnemonicsOptions>(
    MnemonicsOptions.All
  );
  const [selectedServer, setSelectedServer] = useState<Server>(null);
  const { servers, isFetching } = useGetServers();
  const filteredServers = useServerFilter(servers);
  const { connectedServer } = useConnectedServer();

  const onChangeServer = async (event: any) => {
    const selectedServerName = event.selectedItems[0];
    if (!selectedServerName) {
      setSelectedServer(null);
      return;
    }

    const newSelectedServer = servers.filter(
      (server) => server.name === selectedServerName
    )[0];
    setSelectedServer(newSelectedServer);

    const targetServerUrl = getLogCurveValuesViewPath(
      newSelectedServer.url,
      wellUid,
      wellboreUid,
      objectGroup,
      logType,
      objectUid
    );
    const currentSearchParams = createLogCurveValuesSearchParams(
      startIndex,
      endIndex,
      JSON.parse(mnemonicsSearchParams)
    );
    const isTragetUrlTooLong = checkIsUrlTooLong(
      targetServerUrl,
      currentSearchParams
    );
    if (isTragetUrlTooLong) setMnemonicsOption(MnemonicsOptions.All);
    setIsUrlTooLong(isTragetUrlTooLong);
  };

  const handleIndexRangeOptionOnChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setIndexRangeOption(event.target.value as IndexRangeOptions);
  };

  const handleMnemonicsOptionOnChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const newIndexOption = event.target.value as MnemonicsOptions;
    setMnemonicsOption(newIndexOption);
  };

  const handleOnSubmit = () => {
    dispatchOperation({ type: OperationType.HideModal });
    const targetServerLogCurveValuesViewPath = getLogCurveValuesViewPath(
      selectedServer.url,
      wellUid,
      wellboreUid,
      objectGroup,
      logType,
      objectUid
    );
    const targetServerStartIndex =
      indexRangeOption === IndexRangeOptions.Selected ? startIndex : null;
    const targetServerEndIndex =
      indexRangeOption === IndexRangeOptions.Selected ? endIndex : null;
    const targetServerMnemonics =
      mnemonicsOption === MnemonicsOptions.Selected
        ? mnemonicsSearchParams
        : null;
    const targetServerSearchParams = createLogCurveValuesSearchParams(
      targetServerStartIndex,
      targetServerEndIndex,
      JSON.parse(targetServerMnemonics)
    ).toString();
    openRouteInNewWindow(
      `${targetServerLogCurveValuesViewPath}${
        targetServerSearchParams.length !== 0
          ? `?${targetServerSearchParams}`
          : ""
      }`
    );
  };

  return (
    <ModalDialog
      heading={"Show Log Data on Server"}
      content={
        <EdsProvider density={normaliseThemeForEds(theme)}>
          <Autocomplete
            id={"selectServerToShow"}
            label="Select a server"
            initialSelectedOptions={[]}
            options={filteredServers
              .filter((server) => server.id !== connectedServer.id)
              .map((server) => server.name)}
            onOptionsChange={onChangeServer}
          />
          <StyledTypography>Index range:</StyledTypography>
          <label style={alignLayout}>
            <Radio
              id={"indexRangeFullRadio"}
              name="indexRangeFullRadio"
              value={IndexRangeOptions.Full}
              onChange={handleIndexRangeOptionOnChange}
              checked={indexRangeOption === IndexRangeOptions.Full}
            />
            <Typography>Full</Typography>
          </label>
          <label style={alignLayout}>
            <Radio
              id={"indexRangeSelectedRadio"}
              name="indexRangeSelectedRadio"
              value={IndexRangeOptions.Selected}
              onChange={handleIndexRangeOptionOnChange}
              checked={indexRangeOption === IndexRangeOptions.Selected}
            />
            <Typography>Selected</Typography>
          </label>
          <StyledTypography>Mnemonics:</StyledTypography>
          <label style={alignLayout}>
            <Radio
              id={"mnemonicsAllRadio"}
              name="mnemonicsAllRadio"
              value={MnemonicsOptions.All}
              onChange={handleMnemonicsOptionOnChange}
              checked={mnemonicsOption === MnemonicsOptions.All}
            />
            <Typography>All</Typography>
          </label>
          <label style={alignLayout}>
            <Radio
              id={"mnemonicsSelectedRadio"}
              name="mnemonicsSelectedRadio"
              value={MnemonicsOptions.Selected}
              onChange={handleMnemonicsOptionOnChange}
              checked={mnemonicsOption === MnemonicsOptions.Selected}
              disabled={isUrlTooLong}
            />
            <Typography>Selected</Typography>
          </label>
          {isUrlTooLong && (
            <Banner colors={colors}>
              <Banner.Icon variant="warning">
                <Icon name="infoCircle" />
              </Banner.Icon>
              <Banner.Message>
                The selected number of mnemonics is too large to be saved in the
                URL because the URL exceeds the maximum length of 2000
                characters. As a result, it will not be possible to open this
                URL on a different server to access the chosen mnemonics for the
                given log. However, you can still open all mnemonics.
              </Banner.Message>
            </Banner>
          )}
        </EdsProvider>
      }
      isLoading={isFetching}
      onSubmit={() => handleOnSubmit()}
      confirmText={"Show"}
      switchButtonPlaces={false}
      confirmDisabled={!selectedServer}
    />
  );
}

const alignLayout: CSSProperties = {
  display: "flex",
  alignItems: "center"
};

const StyledTypography = styled(Typography)<{ colors: Colors }>`
  padding-top: 16px;
`;
