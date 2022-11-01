import { Table, Typography } from "@equinor/eds-core-react";
import OperationType from "../../contexts/operationType";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import { DispatchOperation } from "../ContextMenus/ContextMenuUtils";
import ModalDialog, { ModalWidth } from "./ModalDialog";

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
    sourceLogCurveInfo.minDateTimeIndex?.getTime() != targetLogCurveInfo.minDateTimeIndex?.getTime() ||
    sourceLogCurveInfo.maxDateTimeIndex?.getTime() != targetLogCurveInfo.maxDateTimeIndex?.getTime() ||
    sourceLogCurveInfo.minDepthIndex != targetLogCurveInfo.minDepthIndex ||
    sourceLogCurveInfo.maxDepthIndex != targetLogCurveInfo.maxDepthIndex
  );
}

export function displayLogComparisonModal(
  sourceLog: LogObject,
  sourceLogCurveInfo: LogCurveInfo[],
  targetLogCurveInfo: LogCurveInfo[],
  sourceServer: Server,
  targetServer: Server,
  dispatchOperation: DispatchOperation
) {
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

  const confirmation = (
    <ModalDialog
      heading={`Log comparison`}
      content={
        <>
          <span>
            <p>Source well name: {sourceLog.wellName}</p>
            <p>Source wellbore name: {sourceLog.wellboreName}</p>
            <p>Source log name: {sourceLog.name}</p>
            <p>Source server: {sourceServer.name}</p>
            <p>Target server: {targetServer.name}</p>
          </span>
          {!indexTypesMatch && (
            <span>
              Unable to compare the logs due to different log types. Source is a {sourceType} log and target is a {targetType} log.
            </span>
          )}
          {mismatchedIndexes.length != 0 && mismatchTable(mismatchedIndexes)}
          {mismatchedIndexes.length == 0 && indexTypesMatch && (
            <span>
              All the {sourceLogCurveInfo.length} source mnemonics match the {targetLogCurveInfo.length} target mnemonics.
            </span>
          )}
        </>
      }
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
      width={ModalWidth.LARGE}
      isLoading={false}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
}

function mismatchTable(mismatchedIndexes: Indexes[]) {
  return (
    <>
      <p>
        {"The following comparison is based on the logCurveInfo elements and does not look at the logData element itself. " +
          "The table shows only the mnemonics where the indexes do not match. " +
          "Mnemonics that are found in only one of the logs are also included. " +
          "Missing mnemonics are indicated by dashes as their index values. " +
          "Mnemonics that have a logCurveInfo element but have empty indexes are specifed as undefined. " +
          "Mnemonics that have equal index values are not shown. " +
          "Differing index values are shown in bold."}
      </p>
      <Table>
        <Table.Caption>
          <Typography variant="h5">Listing of Log Curves where the source indexes and end indexes do not match</Typography>
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
    </>
  );
}
