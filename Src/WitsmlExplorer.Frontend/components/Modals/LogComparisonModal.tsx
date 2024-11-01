import { Accordion, List, TextField } from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import {
  LabelsLayout,
  StyledTypography
} from "components/Modals/ComparisonModalStyles";
import {
  calculateMismatchedIndexes,
  Indexes
} from "components/Modals/LogComparisonUtils";
import { displayMissingObjectModal } from "components/Modals/MissingObjectModals";
import ModalDialog, {
  ModalContentLayout,
  ModalWidth
} from "components/Modals/ModalDialog";
import ProgressSpinner from "components/ProgressSpinner";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import LogCurveInfo from "models/logCurveInfo";
import LogObject from "models/logObject";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import { useEffect, useState } from "react";
import ComponentService from "services/componentService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import StyledAccordion from "../StyledComponents/StyledAccordion";

export interface LogComparisonModalProps {
  sourceLog: LogObject;
  sourceServer: Server;
  targetServer: Server;
  targetObject: ObjectOnWellbore;
  dispatchOperation: DispatchOperation;
}

const LogComparisonModal = (
  props: LogComparisonModalProps
): React.ReactElement => {
  const {
    sourceLog,
    sourceServer,
    targetServer,
    targetObject,
    dispatchOperation
  } = props;
  const {
    operationState: { timeZone, colors, dateTimeFormat }
  } = useOperationState();
  const [sourceLogCurveInfo, setSourceLogCurveInfo] =
    useState<LogCurveInfo[]>(null);
  const [targetLogCurveInfo, setTargetLogCurveInfo] =
    useState<LogCurveInfo[]>(null);
  const [indexesToShow, setIndexesToShow] = useState<Indexes[]>(null);
  const [sourceType, setSourceType] = useState<string>();
  const [targetType, setTargetType] = useState<string>();
  const [indexTypesMatch, setIndexTypesMatch] = useState<boolean>();

  useEffect(() => {
    fetchCurves().then(({ sourceLogCurveInfo, targetLogCurveInfo }) => {
      if (sourceLogCurveInfo.length == 0) {
        dispatchOperation({ type: OperationType.HideModal });
        const failureMessageSource =
          "Unable to compare the log as no log curve infos could be fetched from the source log.";
        displayMissingObjectModal(
          sourceServer,
          sourceLog.wellUid,
          sourceLog.wellboreUid,
          sourceLog.uid,
          dispatchOperation,
          failureMessageSource,
          ObjectType.Log
        );
      } else if (targetLogCurveInfo.length == 0) {
        dispatchOperation({ type: OperationType.HideModal });
        const failureMessageTarget =
          "Unable to compare the log as either the log does not exist on the target server or the target log is empty.";
        displayMissingObjectModal(
          targetServer,
          targetObject.wellUid,
          targetObject.wellboreUid,
          targetObject.uid,
          dispatchOperation,
          failureMessageTarget,
          ObjectType.Log
        );
      } else {
        compareLogCurveInfos(sourceLogCurveInfo, targetLogCurveInfo);
      }
    });
  }, []);

  const fetchCurves = async () => {
    const fetchSource = ComponentService.getComponents(
      sourceLog.wellUid,
      sourceLog.wellboreUid,
      sourceLog.uid,
      ComponentType.Mnemonic
    );
    const fetchTarget = ComponentService.getComponents(
      targetObject.wellUid,
      targetObject.wellboreUid,
      targetObject.uid,
      ComponentType.Mnemonic,
      targetServer
    );
    return {
      sourceLogCurveInfo: await fetchSource,
      targetLogCurveInfo: await fetchTarget
    };
  };

  const compareLogCurveInfos = (
    sourceLogCurveInfo: LogCurveInfo[],
    targetLogCurveInfo: LogCurveInfo[]
  ) => {
    if (
      indexesToShow !== null ||
      sourceLogCurveInfo === null ||
      targetLogCurveInfo === null
    ) {
      return;
    }
    const sourceType =
      sourceLogCurveInfo[0].minDateTimeIndex == null ? "depth" : "time";
    const targetType =
      targetLogCurveInfo[0].minDateTimeIndex == null ? "depth" : "time";
    const indexTypesMatch = sourceType == targetType;

    if (indexTypesMatch) {
      if (sourceType == "time") {
        for (const curve of sourceLogCurveInfo.concat(targetLogCurveInfo)) {
          curve.minDateTimeIndex = formatDateString(
            curve.minDateTimeIndex,
            timeZone,
            dateTimeFormat
          );
          curve.maxDateTimeIndex = formatDateString(
            curve.maxDateTimeIndex,
            timeZone,
            dateTimeFormat
          );
        }
      }
      setIndexesToShow(
        calculateMismatchedIndexes(sourceLogCurveInfo, targetLogCurveInfo)
      );
    } else {
      setIndexesToShow([]);
    }

    setSourceType(sourceType);
    setTargetType(targetType);
    setSourceLogCurveInfo(sourceLogCurveInfo);
    setTargetLogCurveInfo(targetLogCurveInfo);
    setIndexTypesMatch(indexTypesMatch);
  };

  const data = indexesToShow?.map((mismatches) => {
    return {
      mnemonic: mismatches.mnemonic,
      sourceStart: mismatches.sourceStart,
      targetStart: mismatches.targetStart,
      sourceEnd: mismatches.sourceEnd,
      targetEnd: mismatches.targetEnd,
      sourceUnit: mismatches.sourceUnit,
      targetUnit: mismatches.targetUnit
    };
  });

  return (
    <ModalDialog
      heading={`Log header comparison`}
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
                <TextField
                  readOnly
                  id="sourceServer"
                  label="Source Server"
                  defaultValue={sourceServer.name}
                />
                <TextField
                  readOnly
                  id="targetServer"
                  label="Target Server"
                  defaultValue={targetServer.name}
                />
                <TextField
                  readOnly
                  id="sourceWellName"
                  label="Source Well Name"
                  defaultValue={sourceLog.wellName}
                />
                <TextField
                  readOnly
                  id="targetWellName"
                  label="Target Well Name"
                  defaultValue={targetObject.wellName}
                />
                <TextField
                  readOnly
                  id="sourceWellboreName"
                  label="Source Wellbore Name"
                  defaultValue={sourceLog.wellboreName}
                />
                <TextField
                  readOnly
                  id="targetWellboreName"
                  label="Target Wellbore Name"
                  defaultValue={targetObject.wellboreName}
                />
                <TextField
                  readOnly
                  id="sourceName"
                  label="Source Log"
                  defaultValue={
                    sourceLog.name +
                    (sourceLog.runNumber == null
                      ? ""
                      : ` (${sourceLog.runNumber})`)
                  }
                />
                <TextField
                  readOnly
                  id="targetName"
                  label="Target Log"
                  defaultValue={targetObject.name}
                />
              </LabelsLayout>
              <StyledAccordion>
                <Accordion.Item>
                  <StyledAccordionHeader colors={colors}>
                    How are the logs compared?
                  </StyledAccordionHeader>
                  <Accordion.Panel
                    style={{ backgroundColor: colors.ui.backgroundLight }}
                  >
                    <List>
                      <List.Item>
                        The logs are compared based on the <b>logCurveInfo</b>{" "}
                        elements. The <b>logData</b> element is <b>not</b>{" "}
                        compared.
                      </List.Item>
                      <List.Item>
                        The table shows only the mnemonics where the indexes do
                        not match, mnemonics that have equal index values are
                        not shown.
                      </List.Item>
                      <List.Item>
                        Mnemonics that are found in only one of the logs are
                        also included.
                      </List.Item>
                      <List.Item>
                        Some mnemonics are shown with a dash (“-”) index value,
                        this is caused by one of two reasons:
                        <List>
                          <List.Item>The mnemonic is missing</List.Item>
                          <List.Item>
                            The mnemonic has a <b>logCurveInfo</b> element, but
                            the index is empty.
                          </List.Item>
                        </List>
                      </List.Item>
                    </List>
                  </Accordion.Panel>
                </Accordion.Item>
              </StyledAccordion>
              {!indexTypesMatch && (
                <span>
                  Unable to compare the logs due to different log types. Source
                  is a {sourceType} log and target is a {targetType} log.
                </span>
              )}
              {indexesToShow.length != 0 && data && (
                <>
                  <StyledTypography colors={colors} variant="h5">
                    Listing of Log Curves where indexes do not match
                  </StyledTypography>
                  <ContentTable
                    columns={columns}
                    data={data}
                    downloadToCsvFileName={"LogHeaderComparison"}
                  />
                </>
              )}
              {indexesToShow.length == 0 && indexTypesMatch && (
                <span>
                  All the {sourceLogCurveInfo.length} source mnemonics match the{" "}
                  {targetLogCurveInfo.length} target mnemonics.
                </span>
              )}
            </>
          )) || (
            <ProgressSpinner message="Fetching source and target log curve infos." />
          )}
        </ModalContentLayout>
      }
    />
  );
};

const columns: ContentTableColumn[] = [
  {
    property: "mnemonic",
    label: "mnemonic",
    type: ContentType.String
  },
  {
    property: "sourceStart",
    label: "sourceStart",
    type: ContentType.String
  },
  {
    property: "targetStart",
    label: "targetStart",
    type: ContentType.String
  },
  {
    property: "sourceEnd",
    label: "sourceEnd",
    type: ContentType.String
  },
  {
    property: "targetEnd",
    label: "targetEnd",
    type: ContentType.String
  },
  {
    property: "sourceUnit",
    label: "sourceUnit",
    type: ContentType.String
  },
  {
    property: "targetUnit",
    label: "targetUnit",
    type: ContentType.String
  }
];

export const StyledAccordionHeader = styled(Accordion.Header)<{
  colors: Colors;
}>`
  background-color: ${(props) => props.colors.ui.backgroundDefault};

  &:hover {
    background-color: ${(props) => props.colors.ui.backgroundLight};
  }

  span {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
`;

export default LogComparisonModal;
