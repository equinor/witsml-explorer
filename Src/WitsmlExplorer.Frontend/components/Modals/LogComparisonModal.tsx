import { Button, Popover, Table, TextField, Typography } from "@equinor/eds-core-react";
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import OperationType from "../../contexts/operationType";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import CredentialsService from "../../services/credentialsService";
import LogObjectService from "../../services/logObjectService";
import Icon from "../../styles/Icons";
import { DispatchOperation } from "../ContextMenus/ContextMenuUtils";
import { displayMissingLogModal } from "../Modals/MissingObjectModals";
import ProgressSpinner from "../ProgressSpinner";
import ModalDialog, { ModalContentLayout, ModalWidth } from "./ModalDialog";

interface Indexes {
  mnemonic: string;
  sourceStart: string;
  targetStart: string;
  sourceEnd: string;
  targetEnd: string;
}

function logCurveInfoToIndexes(sourceLogCurveInfo?: LogCurveInfo, targetLogCurveInfo?: LogCurveInfo): Indexes {
  return {
    mnemonic: sourceLogCurveInfo ? sourceLogCurveInfo.mnemonic : targetLogCurveInfo.mnemonic,
    sourceStart: getStartIndex(sourceLogCurveInfo),
    targetStart: getStartIndex(targetLogCurveInfo),
    sourceEnd: getEndIndex(sourceLogCurveInfo),
    targetEnd: getEndIndex(targetLogCurveInfo)
  };
}

function getStartIndex(logCurveInfo?: LogCurveInfo): string {
  if (!logCurveInfo) {
    return "-";
  }
  if (logCurveInfo.minDepthIndex != null) {
    return logCurveInfo.minDepthIndex.toString();
  }
  if (logCurveInfo.minDateTimeIndex != null) {
    return logCurveInfo.minDateTimeIndex.toString();
  }
  return "undefined";
}

function getEndIndex(logCurveInfo?: LogCurveInfo): string {
  if (!logCurveInfo) {
    return "-";
  }
  if (logCurveInfo.maxDepthIndex != null) {
    return logCurveInfo.maxDepthIndex.toString();
  }
  if (logCurveInfo.maxDateTimeIndex != null) {
    return logCurveInfo.maxDateTimeIndex.toString();
  }
  return "undefined";
}

function areMismatched(sourceLogCurveInfo: LogCurveInfo, targetLogCurveInfo: LogCurveInfo): boolean {
  return (
    sourceLogCurveInfo.minDateTimeIndex != targetLogCurveInfo.minDateTimeIndex ||
    sourceLogCurveInfo.maxDateTimeIndex != targetLogCurveInfo.maxDateTimeIndex ||
    sourceLogCurveInfo.minDepthIndex != targetLogCurveInfo.minDepthIndex ||
    sourceLogCurveInfo.maxDepthIndex != targetLogCurveInfo.maxDepthIndex
  );
}

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
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const popoverAnchorRef = useRef<HTMLButtonElement>(null);

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

    const mismatchedIndexes = [];
    if (indexTypesMatch) {
      for (const sourceCurve of sourceLogCurveInfo) {
        const targetCurve = targetLogCurveInfo.find((targetCurve) => targetCurve.mnemonic == sourceCurve.mnemonic);
        if (!targetCurve || areMismatched(sourceCurve, targetCurve)) {
          mismatchedIndexes.push(logCurveInfoToIndexes(sourceCurve, targetCurve));
        }
      }
      for (const targetCurve of targetLogCurveInfo) {
        const sourceCurve = sourceLogCurveInfo.find((sourceCurve) => sourceCurve.mnemonic == targetCurve.mnemonic);
        if (!sourceCurve) {
          mismatchedIndexes.push(logCurveInfoToIndexes(sourceCurve, targetCurve));
        }
      }
    }
    setSourceType(sourceType);
    setTargetType(targetType);
    setIndexTypesMatch(indexTypesMatch);
    setIndexesToShow(mismatchedIndexes);
  }, [sourceLogCurveInfo, targetLogCurveInfo]);

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
              {indexesToShow.length != 0 && mismatchTable(indexesToShow, isPopoverOpen, setIsPopoverOpen, popoverAnchorRef)}
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

function mismatchTable(mismatchedIndexes: Indexes[], isPopoverOpen: boolean, setIsPopoverOpen: Dispatch<SetStateAction<boolean>>, anchorRef: MutableRefObject<HTMLButtonElement>) {
  return (
    <>
      <TableLayout>
        <Table>
          <Table.Caption>
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
          </Table.Caption>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Curve mnemonic</Table.Cell>
              <Table.Cell>Source start</Table.Cell>
              <Table.Cell>Target start</Table.Cell>
              <Table.Cell>Source end</Table.Cell>
              <Table.Cell>Target end</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {mismatchedIndexes.map((indexes, i) => (
              <Table.Row key={i}>
                <Table.Cell>{indexes.mnemonic}</Table.Cell>
                <Table.Cell>{(indexes.sourceStart != indexes.targetStart && <b>{indexes.sourceStart}</b>) || indexes.sourceStart}</Table.Cell>
                <Table.Cell>{(indexes.sourceStart != indexes.targetStart && <b>{indexes.targetStart}</b>) || indexes.targetStart}</Table.Cell>
                <Table.Cell>{(indexes.sourceEnd != indexes.targetEnd && <b>{indexes.sourceEnd}</b>) || indexes.sourceEnd}</Table.Cell>
                <Table.Cell>{(indexes.sourceEnd != indexes.targetEnd && <b>{indexes.targetEnd}</b>) || indexes.targetEnd}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </TableLayout>
    </>
  );
}
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
