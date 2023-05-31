import { Accordion, List, TextField, Typography } from "@equinor/eds-core-react";
import { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import ComponentService from "../../services/componentService";
import SortableEdsTable, { Column } from "../ContentViews/table/SortableEdsTable";
import { DispatchOperation } from "../ContextMenus/ContextMenuUtils";
import formatDateString from "../DateFormatter";
import { displayMissingObjectModal } from "../Modals/MissingObjectModals";
import ProgressSpinner from "../ProgressSpinner";
import { Indexes, calculateMismatchedIndexes, markDateTimeStringDifferences, markNumberDifferences } from "./LogComparisonUtils";
import ModalDialog, { ModalContentLayout, ModalWidth } from "./ModalDialog";

export interface LogComparisonModalProps {
  sourceLog: LogObject;
  sourceServer: Server;
  targetServer: Server;
  targetObject: ObjectOnWellbore;
  dispatchOperation: DispatchOperation;
}

const LogComparisonModal = (props: LogComparisonModalProps): React.ReactElement => {
  const { sourceLog, sourceServer, targetServer, targetObject, dispatchOperation } = props;
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [sourceLogCurveInfo, setSourceLogCurveInfo] = useState<LogCurveInfo[]>(null);
  const [targetLogCurveInfo, setTargetLogCurveInfo] = useState<LogCurveInfo[]>(null);
  const [indexesToShow, setIndexesToShow] = useState<Indexes[]>(null);
  const [sourceType, setSourceType] = useState<string>();
  const [targetType, setTargetType] = useState<string>();
  const [indexTypesMatch, setIndexTypesMatch] = useState<boolean>();

  useEffect(() => {
    const setCurves = async () => {
      const fetchCurves = async () => {
        const fetchSource = ComponentService.getComponents(sourceLog.wellUid, sourceLog.wellboreUid, sourceLog.uid, ComponentType.Mnemonic);
        const fetchTarget = ComponentService.getComponents(targetObject.wellUid, targetObject.wellboreUid, targetObject.uid, ComponentType.Mnemonic, targetServer);
        return {
          sourceLogCurveInfo: await fetchSource,
          targetLogCurveInfo: await fetchTarget
        };
      };
      const { sourceLogCurveInfo, targetLogCurveInfo } = await fetchCurves();
      if (sourceLogCurveInfo.length == 0) {
        dispatchOperation({ type: OperationType.HideModal });
        const failureMessageSource = "Unable to compare the log as no log curve infos could be fetched from the source log.";
        displayMissingObjectModal(sourceServer, sourceLog.wellUid, sourceLog.wellboreUid, sourceLog.uid, dispatchOperation, failureMessageSource, ObjectType.Log);
        return;
      } else if (targetLogCurveInfo.length == 0) {
        dispatchOperation({ type: OperationType.HideModal });
        const failureMessageTarget = "Unable to compare the log as either the log does not exist on the target server or the target log is empty.";
        displayMissingObjectModal(targetServer, targetObject.wellUid, targetObject.wellboreUid, targetObject.uid, dispatchOperation, failureMessageTarget, ObjectType.Log);
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

    if (indexTypesMatch) {
      if (sourceType == "time") {
        for (const curve of sourceLogCurveInfo.concat(targetLogCurveInfo)) {
          curve.minDateTimeIndex = formatDateString(curve.minDateTimeIndex, timeZone);
          curve.maxDateTimeIndex = formatDateString(curve.maxDateTimeIndex, timeZone);
        }
      }
      setIndexesToShow(calculateMismatchedIndexes(sourceLogCurveInfo, targetLogCurveInfo));
    } else {
      setIndexesToShow([]);
    }

    setSourceType(sourceType);
    setTargetType(targetType);
    setIndexTypesMatch(indexTypesMatch);
  }, [sourceLogCurveInfo, targetLogCurveInfo]);

  const data = useMemo(
    () =>
      indexesToShow?.map((indexes) => {
        const [markedSourceStart, markedTargetStart] =
          sourceType == "depth"
            ? markNumberDifferences(indexes.sourceStart, indexes.targetStart)
            : markDateTimeStringDifferences(indexes.sourceStart as string, indexes.targetStart as string);
        const [markedSourceEnd, markedTargetEnd] =
          sourceType == "depth"
            ? markNumberDifferences(indexes.sourceEnd, indexes.targetEnd)
            : markDateTimeStringDifferences(indexes.sourceEnd as string, indexes.targetEnd as string);
        return {
          mnemonic: indexes.mnemonic,
          startIndexes: indexes.sourceStart,
          endIndexes: indexes.sourceEnd,
          mnemonicValue: <Typography>{indexes.mnemonic}</Typography>,
          startIndexesValue: (
            <TableCell type={sourceType}>
              <Typography>{markedSourceStart}</Typography>
              <Typography>{markedTargetStart}</Typography>
            </TableCell>
          ),
          endIndexesValue: (
            <TableCell type={sourceType}>
              <Typography>{markedSourceEnd}</Typography>
              <Typography>{markedTargetEnd}</Typography>
            </TableCell>
          )
        };
      }),
    [indexesToShow]
  );

  return (
    <ModalDialog
      heading={`Log comparison`}
      onSubmit={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
      width={ModalWidth.LARGE}
      isLoading={false}
      content={
        <ModalContentLayout>
          {(indexesToShow && (
            <>
              <LabelsLayout>
                <TextField readOnly id="sourceServer" label="Source Server" defaultValue={sourceServer.name} />
                <TextField readOnly id="targetServer" label="Target Server" defaultValue={targetServer.name} />
                <TextField readOnly id="sourceWellName" label="Source Well Name" defaultValue={sourceLog.wellName} />
                <TextField readOnly id="targetWellName" label="Target Well Name" defaultValue={targetObject.wellName} />
                <TextField readOnly id="sourceWellboreName" label="Source Wellbore Name" defaultValue={sourceLog.wellboreName} />
                <TextField readOnly id="targetWellboreName" label="Target Wellbore Name" defaultValue={targetObject.wellboreName} />
                <TextField readOnly id="sourceName" label="Source Log" defaultValue={sourceLog.name + (sourceLog.runNumber == null ? "" : ` (${sourceLog.runNumber})`)} />
                <TextField readOnly id="targetName" label="Target Log" defaultValue={targetObject.name} />
              </LabelsLayout>
              <Accordion>
                <Accordion.Item>
                  <Accordion.Header>How are the logs compared?</Accordion.Header>
                  <Accordion.Panel>
                    <List>
                      <List.Item>
                        The logs are compared based on the <b>logCurveInfo</b> elements. The <b>logData</b> element is <b>not</b> compared.
                      </List.Item>
                      <List.Item>The table shows only the mnemonics where the indexes do not match, mnemonics that have equal index values are not shown.</List.Item>
                      <List.Item>Mnemonics that are found in only one of the logs are also included.</List.Item>
                      <List.Item>
                        Some mnemonics are shown with a dash (“-”) index value, this is caused by one of two reasons:
                        <List>
                          <List.Item>The mnemonic is missing</List.Item>
                          <List.Item>
                            The mnemonic has a <b>logCurveInfo</b> element, but the index is empty.
                          </List.Item>
                        </List>
                      </List.Item>
                      <List.Item>Differing index values are highlighted with bold text.</List.Item>
                    </List>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
              {!indexTypesMatch && (
                <span>
                  Unable to compare the logs due to different log types. Source is a {sourceType} log and target is a {targetType} log.
                </span>
              )}
              {indexesToShow.length != 0 && data && (
                <TableLayout>
                  <SortableEdsTable
                    columns={columns}
                    data={data}
                    caption={<StyledTypography variant="h5">Listing of Log Curves where the source indexes and end indexes do not match</StyledTypography>}
                  />
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
    />
  );
};

const columns: Column[] = [
  { name: "Curve mnemonic", accessor: "mnemonic", sortDirection: "ascending" },
  { name: "Source/target start", accessor: "startIndexes" },
  { name: "Source/target end", accessor: "endIndexes" }
];

const LabelsLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 0.8rem;
`;

const TableCell = styled.div<{ type?: string }>`
  font-feature-settings: "tnum";
  p {
    text-align: ${({ type }) => (type == "depth" ? "right" : "left")};
  }
  mark {
    background: #e6faec;
    background-blend-mode: darken;
    font-weight: 600;
  }
`;

const TableLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTypography = styled(Typography)`
  padding: 1rem 0 1rem 0;
`;
export default LogComparisonModal;
