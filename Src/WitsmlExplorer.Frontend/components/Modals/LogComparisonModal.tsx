import { Button, Popover, TextField, Typography } from "@equinor/eds-core-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import OperationType from "../../contexts/operationType";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import CredentialsService from "../../services/credentialsService";
import LogObjectService from "../../services/logObjectService";
import Icon from "../../styles/Icons";
import SortableEdsTable, { Column } from "../ContentViews/table/SortableEdsTable";
import { DispatchOperation } from "../ContextMenus/ContextMenuUtils";
import { displayMissingLogModal } from "../Modals/MissingObjectModals";
import ProgressSpinner from "../ProgressSpinner";
import { calculateMismatchedIndexes, Indexes } from "./LogComparisonUtils";
import ModalDialog, { ModalContentLayout, ModalWidth } from "./ModalDialog";

export interface LogComparisonModalProps {
  sourceLog: LogObject;
  sourceServer: Server;
  targetServer: Server;
  dispatchOperation: DispatchOperation;
}

const LogComparisonModal = (props: LogComparisonModalProps): React.ReactElement => {
  const { sourceLog, sourceServer, targetServer, dispatchOperation } = props;
  const [sourceLogCurveInfo, setSourceLogCurveInfo] = useState<LogCurveInfo[]>(null);
  const [targetLogCurveInfo, setTargetLogCurveInfo] = useState<LogCurveInfo[]>(null);
  const [indexesToShow, setIndexesToShow] = useState<Indexes[]>(null);
  const [sourceType, setSourceType] = useState<string>();
  const [targetType, setTargetType] = useState<string>();
  const [indexTypesMatch, setIndexTypesMatch] = useState<boolean>();

  useEffect(() => {
    const setCurves = async () => {
      const wellUid = sourceLog.wellUid;
      const wellboreUid = sourceLog.wellboreUid;
      const fetchCurves = async () => {
        const targetCredentials = CredentialsService.getCredentialsForServer(targetServer);
        const fetchSource = LogObjectService.getLogCurveInfo(wellUid, wellboreUid, sourceLog.uid);
        const fetchTarget = LogObjectService.getLogCurveInfoFromServer(wellUid, wellboreUid, sourceLog.uid, targetCredentials);
        return {
          sourceLogCurveInfo: await fetchSource,
          targetLogCurveInfo: await fetchTarget
        };
      };
      const { sourceLogCurveInfo, targetLogCurveInfo } = await fetchCurves();
      if (sourceLogCurveInfo.length == 0) {
        dispatchOperation({ type: OperationType.HideModal });
        const failureMessageSource = "Unable to compare the log as no log curve infos could be fetched from the source log.";
        displayMissingLogModal(sourceServer, wellUid, wellboreUid, sourceLog.uid, dispatchOperation, failureMessageSource);
        return;
      } else if (targetLogCurveInfo.length == 0) {
        dispatchOperation({ type: OperationType.HideModal });
        const failureMessageTarget = "Unable to compare the log as either the log does not exist on the target server or the target log is empty.";
        displayMissingLogModal(targetServer, wellUid, wellboreUid, sourceLog.uid, dispatchOperation, failureMessageTarget);
        return;
      } else {
        setSourceLogCurveInfo(sourceLogCurveInfo);
        setTargetLogCurveInfo(targetLogCurveInfo);
      }
    };
    setCurves();
  }, []);

  useEffect(() => {
    if (indexesToShow !== null || sourceLogCurveInfo === null || targetLogCurveInfo === null) {
      return;
    }
    const sourceType = sourceLogCurveInfo[0].minDateTimeIndex == null ? "depth" : "time";
    const targetType = targetLogCurveInfo[0].minDateTimeIndex == null ? "depth" : "time";
    const indexTypesMatch = sourceType == targetType;

    const mismatchedIndexes = indexTypesMatch ? calculateMismatchedIndexes(sourceLogCurveInfo, targetLogCurveInfo) : [];

    setSourceType(sourceType);
    setTargetType(targetType);
    setIndexTypesMatch(indexTypesMatch);
    setIndexesToShow(mismatchedIndexes);
  }, [sourceLogCurveInfo, targetLogCurveInfo]);

  const data = useMemo(
    () =>
      indexesToShow?.map((indexes) => {
        const startDifferent = indexes.sourceStart != indexes.targetStart;
        const endDifferent = indexes.sourceEnd != indexes.targetEnd;
        return {
          mnemonic: indexes.mnemonic,
          sourceStart: startDifferent ? <b>{indexes.sourceStart}</b> : indexes.sourceStart,
          targetStart: startDifferent ? <b>{indexes.targetStart}</b> : indexes.targetStart,
          sourceEnd: endDifferent ? <b>{indexes.sourceEnd} </b> : indexes.sourceEnd,
          targetEnd: endDifferent ? <b>{indexes.targetEnd}</b> : indexes.targetEnd
        };
      }),
    [indexesToShow]
  );

  return (
    <ModalDialog
      heading={`Log comparison`}
      content={
        <ModalContentLayout>
          {(indexesToShow && (
            <>
              <TextField readOnly id="wellName" label="Well Name" defaultValue={sourceLog.wellName} />
              <TextField readOnly id="wellboreName" label="Wellbore Name" defaultValue={sourceLog.wellboreName} />
              <TextField readOnly id="name" label="Log Name" defaultValue={sourceLog.name} />
              <TextField readOnly id="sourceServer" label="Source Server" defaultValue={sourceServer.name} />
              <TextField readOnly id="targetServer" label="Target Server" defaultValue={targetServer.name} />
              {!indexTypesMatch && (
                <span>
                  Unable to compare the logs due to different log types. Source is a {sourceType} log and target is a {targetType} log.
                </span>
              )}
              {indexesToShow.length != 0 && data && (
                <TableLayout>
                  <SortableEdsTable caption={<Caption />} columns={columns} data={data} />
                </TableLayout>
              )}
              {indexesToShow.length == 0 && indexTypesMatch && (
                <span>
                  All the {sourceLogCurveInfo.length} source mnemonics match the {targetLogCurveInfo.length} target mnemonics.
                </span>
              )}
            </>
          )) || <ProgressSpinner message="Fetching source and target log curve infos." />}
        </ModalContentLayout>
      }
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
      width={ModalWidth.LARGE}
      isLoading={false}
    />
  );
};

const columns: Column[] = [
  { name: "Curve mnemonic", accessor: "mnemonic", sortDirection: "ascending", isSorted: true },
  { name: "Source start", accessor: "sourceStart" },
  { name: "Target start", accessor: "targetStart" },
  { name: "Source end", accessor: "sourceEnd" },
  { name: "Target end", accessor: "targetEnd" }
];

const Caption = (): React.ReactElement => {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <StyledTypography variant="h5">
      <span style={{ paddingTop: "0.2rem" }}>Listing of Log Curves where the source indexes and end indexes do not match</span>
      <Popover anchorEl={anchorRef.current} onClose={() => setIsPopoverOpen(false)} open={isPopoverOpen} placement="top">
        <Popover.Content>
          <Typography variant="body_short">
            {"The following comparison is based on the logCurveInfo elements and does not look at the logData element itself. " +
              "The table shows only the mnemonics where the indexes do not match. " +
              "Mnemonics that are found in only one of the logs are also included. " +
              "Missing mnemonics are indicated by dashes as their index values. " +
              "Mnemonics that have a logCurveInfo element but have empty indexes are specifed as undefined. " +
              "Mnemonics that have equal index values are not shown. " +
              "Differing index values are shown in bold."}
          </Typography>
        </Popover.Content>
      </Popover>
      <Button variant="ghost_icon" onClick={() => setIsPopoverOpen(true)} ref={anchorRef}>
        <Icon name="infoCircle" />
      </Button>
    </StyledTypography>
  );
};

const TableLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTypography = styled(Typography)`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default LogComparisonModal;
