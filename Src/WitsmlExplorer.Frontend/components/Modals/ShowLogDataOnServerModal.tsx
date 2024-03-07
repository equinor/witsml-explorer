import {
  Autocomplete,
  Banner,
  Radio,
  Typography
} from "@equinor/eds-core-react";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import ModalDialog from "components/Modals/ModalDialog";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { Server } from "models/server";
import { ChangeEvent, useContext, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { checkIsUrlTooLong } from "routes/utils/checkIsUrlTooLong";
import { createLogCurveValuesSearchParams } from "routes/utils/createLogCurveValuesSearchParams";
import { getLogCurveValuesViewPath } from "routes/utils/pathBuilder";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

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
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
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
    const host = `${window.location.protocol}//${window.location.host}`;
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
    window.open(
      `${host}${targetServerLogCurveValuesViewPath}${
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
        <>
          <Autocomplete
            label="Select a server"
            initialSelectedOptions={[]}
            options={servers.map((server) => server.name)}
            onOptionsChange={onChangeServer}
          />
          <StyledTypography>Index range:</StyledTypography>
          <label style={alignLayout}>
            <Radio
              name="indexRangeRadios"
              value={IndexRangeOptions.Full}
              id={IndexRangeOptions.Full}
              onChange={handleIndexRangeOptionOnChange}
              checked={indexRangeOption === IndexRangeOptions.Full}
              defaultChecked
            />
            <Typography>Full</Typography>
          </label>
          <label style={alignLayout}>
            <Radio
              name="indexRangeRadios"
              id={IndexRangeOptions.Selected}
              value={IndexRangeOptions.Selected}
              onChange={handleIndexRangeOptionOnChange}
              checked={indexRangeOption === IndexRangeOptions.Selected}
            />
            <Typography>Selected</Typography>
          </label>
          <StyledTypography>Mnemonics:</StyledTypography>
          <label style={alignLayout}>
            <Radio
              name="mnemonicsRadios"
              id={MnemonicsOptions.All}
              value={MnemonicsOptions.All}
              onChange={handleMnemonicsOptionOnChange}
              checked={mnemonicsOption === MnemonicsOptions.All}
              defaultChecked
            />
            <Typography>All</Typography>
          </label>
          <label style={alignLayout}>
            <Radio
              name="mnemonicsRadios"
              value={MnemonicsOptions.Selected}
              id={MnemonicsOptions.Selected}
              onChange={handleMnemonicsOptionOnChange}
              checked={mnemonicsOption === MnemonicsOptions.Selected}
              disabled={isUrlTooLong}
            />
            <Typography>Selected</Typography>
          </label>
          {isUrlTooLong && (
            <StyledBanner colors={colors}>
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
            </StyledBanner>
          )}
        </>
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

const StyledBanner = styled(Banner)<{ colors: Colors }>`
  background-color: ${(props) => props.colors.ui.backgroundDefault};
  span {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  div {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
  p {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  hr {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
`;
