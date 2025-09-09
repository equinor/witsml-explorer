import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { ProgressSpinnerOverlay } from "../../ProgressSpinner.tsx";
import { ContentTable, ContentTableColumn, ContentType } from "../table";
import {
  getTableData,
  LogCurveInfoRow
} from "../LogCurveInfoListViewUtils.tsx";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import { useCurveThreshold } from "../../../contexts/curveThresholdContext.tsx";
import LogObject from "../../../models/logObject.tsx";
import LogObjectService from "../../../services/logObjectService.tsx";
import LogCurveInfo from "../../../models/logCurveInfo.ts";
import {
  MultiLogCurveInfoViewData,
  MultiLogMetadata,
  MultiLogSelectionCurveInfo
} from "../../MultiLogUtils.tsx";
import { CommonPanelContainer } from "../../StyledComponents/Container.tsx";
import { Button } from "../../StyledComponents/Button.tsx";
import MultiLogCurveInfo from "../../../models/multilogCurveInfo.ts";
import styled from "styled-components";
import { Autocomplete } from "@equinor/eds-core-react";
import {
  WITSML_INDEX_TYPE,
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "../../Constants.tsx";
import { Colors } from "../../../styles/Colors.tsx";

interface MultiLogCurveSelectionListProps {
  multiLogSelectionCurveInfos: MultiLogSelectionCurveInfo[];
  multiLogMetadatas: MultiLogMetadata[];
  logObjects: LogObject[];
  indexType: WITSML_INDEX_TYPE;
  onIndexTypeChange: (indexType: WITSML_INDEX_TYPE) => void;
  onAdd: () => void;
  onRemoveAll: () => void;
  onRemoveSelected: (selectedRows: LogCurveInfoRow[]) => void;
  onShowValues: (selectedRows: LogCurveInfoRow[]) => void;
}

const MultiLogCurveSelectionList = (
  props: MultiLogCurveSelectionListProps
): React.ReactElement => {
  const {
    multiLogSelectionCurveInfos,
    multiLogMetadatas,
    logObjects,
    indexType,
    onIndexTypeChange,
    onAdd,
    onRemoveAll,
    onRemoveSelected,
    onShowValues
  } = props;
  const {
    operationState: { colors, timeZone, dateTimeFormat }
  } = useOperationState();
  const { curveThreshold } = useCurveThreshold();
  const [logObjectMap, setLogObjectMap] = useState<Map<string, LogObject>>();
  const [logCurveInfoList, setLogCurveInfoList] = useState<LogCurveInfo[]>([]);
  const [indexCurveInfoList, setIndexCurveInfoList] = useState<
    MultiLogCurveInfo[]
  >([]);

  const [isValidSelection, setIsValidSelection] = useState<boolean>(true);
  const [isFetchingLogs, setIsFetchingLogs] = useState<boolean>(true);
  const [isFetchedLogs, setIsFetchedLogs] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<LogCurveInfoRow[]>([]);

  const isDepthIndex = indexType == WITSML_INDEX_TYPE_MD;

  useEffect(() => {
    const getLogObjects = async () => {
      if (
        !isFetchedLogs &&
        multiLogMetadatas?.length > 0 &&
        logObjects?.length > 0
      ) {
        setIsFetchingLogs(true);

        let logInfoProcessed: {
          serverId: string;
          wellId: string;
          wellboreId: string;
        }[] = [];

        const map = new Map<string, LogObject>();
        logObjects.forEach((lo) => map.set(lo.uid, lo));
        setLogObjectMap(map);

        const logCurveInfos: MultiLogCurveInfoViewData[] = [];
        const indexCurveInfos: LogCurveInfo[] = [];

        for (const logInfo of multiLogMetadatas) {
          if (
            logInfoProcessed.some(
              (lip) =>
                lip.wellboreId == logInfo.wellboreId &&
                lip.wellId == logInfo.wellId &&
                lip.serverId == logInfo.server.id
            )
          ) {
            continue;
          }

          const logs = multiLogMetadatas.filter(
            (lo) =>
              lo.wellboreId == logInfo.wellboreId &&
              lo.wellId == logInfo.wellId &&
              lo.server.id == logInfo.server.id
          );

          if (!!logs && logs.length > 0) {
            const mnemonics = multiLogSelectionCurveInfos
              .filter(
                (i) =>
                  i.wellboreId == logInfo.wellboreId &&
                  i.wellId == logInfo.wellId &&
                  i.serverId == logInfo.server.id
              )
              .map((i) => i.mnemonic);

            const mlcis = await LogObjectService.getMultiLogsCurveInfo(
              logInfo.wellId,
              logInfo.wellboreId,
              logs.map((l) => l.logId),
              new AbortController().signal,
              logInfo.server
            );

            for (const mlci of mlcis) {
              if (
                mnemonics.some(
                  (m) => m.toLowerCase() === mlci.mnemonic.toLowerCase()
                )
              ) {
                logCurveInfos.push({
                  ...mlci,
                  serverName: logInfo.server.name
                });
              } else if (
                logObjects.some(
                  (lo) =>
                    lo.uid.toLowerCase() === mlci.logUid.toLowerCase() &&
                    lo.indexCurve.toLowerCase() === mlci.mnemonic.toLowerCase()
                )
              ) {
                indexCurveInfos.push(mlci);
              }
            }
          }

          logInfoProcessed = logInfoProcessed.concat([
            {
              serverId: logInfo.server.id,
              wellId: logInfo.wellId,
              wellboreId: logInfo.wellboreId
            }
          ]);
        }
        setIndexCurveInfoList(indexCurveInfos);
        setLogCurveInfoList(logCurveInfos);
        setIsFetchingLogs(false);
        setIsFetchedLogs(true);
      } else {
        setIsFetchingLogs(false);
      }
    };
    getLogObjects();
  }, [multiLogMetadatas, logObjects]);

  const updateSelectedRows = (rows: LogCurveInfoRow[]) => {
    if (rows.length > 1) {
      let lastRowUnit = indexCurveInfoList.find(
        (i) => i.logUid.toLowerCase() === rows[0].logUid.toLowerCase()
      ).unit;
      let isValid = true;
      for (const row of rows) {
        const rowUnit = indexCurveInfoList.find(
          (i) => i.logUid.toLowerCase() === row.logUid.toLowerCase()
        ).unit;
        if (rowUnit.toLowerCase() !== lastRowUnit.toLowerCase()) {
          isValid = false;
          break;
        }
        lastRowUnit = rowUnit;
      }
      setIsValidSelection(isValid);
    } else {
      setIsValidSelection(true);
    }
    setSelectedRows(rows);
  };

  const columns: ContentTableColumn[] = useMemo(() => {
    return [
      { property: "mnemonic", label: "mnemonic", type: ContentType.String },
      { property: "serverName", label: "serverName", type: ContentType.String },
      { property: "wellName", label: "wellName", type: ContentType.String },
      {
        property: "wellboreName",
        label: "wellboreName",
        type: ContentType.String
      },
      { property: "logName", label: "logName", type: ContentType.String },
      {
        property: "minIndex",
        label: "minIndex",
        type: isDepthIndex ? ContentType.Number : ContentType.DateTime
      },
      {
        property: "maxIndex",
        label: "maxIndex",
        type: isDepthIndex ? ContentType.Number : ContentType.DateTime
      },
      {
        property: "classWitsml",
        label: "classWitsml",
        type: ContentType.String
      },
      { property: "unit", label: "unit", type: ContentType.String },
      {
        property: "sensorOffset",
        label: "sensorOffset",
        type: ContentType.Measure
      },
      {
        property: "curveDescription",
        label: "curveDescription",
        type: ContentType.String
      },
      { property: "mnemAlias", label: "mnemAlias", type: ContentType.String },
      { property: "traceState", label: "traceState", type: ContentType.String },
      { property: "nullValue", label: "nullValue", type: ContentType.String },
      { property: "uid", label: "uid", type: ContentType.String },
      { property: "serverUrl", label: "serverUrl", type: ContentType.String }
    ];
  }, [isDepthIndex, logObjectMap]);

  const panelElements = [
    <CommonPanelContainer key="indexTypePanel">
      <StyledAutocomplete
        id={"indexType"}
        label={"Index type:"}
        hideClearButton={true}
        selectedOptions={[indexType]}
        options={[WITSML_INDEX_TYPE_MD, WITSML_INDEX_TYPE_DATE_TIME]}
        onOptionsChange={(changes) => {
          onIndexTypeChange(changes.selectedItems[0] as WITSML_INDEX_TYPE);
        }}
        style={
          {
            "--eds-input-background": colors.ui.backgroundDefault
          } as CSSProperties
        }
        colors={colors}
      />
    </CommonPanelContainer>,
    <CommonPanelContainer key="addPanel">
      <Button onClick={() => onAdd()}>Add</Button>
    </CommonPanelContainer>,
    <CommonPanelContainer key="removeSelectedPanel">
      <Button
        disabled={selectedRows?.length < 1}
        onClick={() => onRemoveSelected(selectedRows)}
      >
        Remove Selected
      </Button>
    </CommonPanelContainer>,
    <CommonPanelContainer key="removeAllPanel">
      <Button
        disabled={multiLogMetadatas?.length == 0}
        onClick={() => onRemoveAll()}
      >
        Remove All
      </Button>
    </CommonPanelContainer>,
    <CommonPanelContainer key="showValuesPanel">
      <Button
        disabled={!isValidSelection || !selectedRows || selectedRows.length < 1}
        onClick={() => onShowValues(selectedRows)}
      >
        Show Values
      </Button>
    </CommonPanelContainer>
  ];

  return (
    <>
      {isFetchingLogs && <ProgressSpinnerOverlay message="Fetching Logs." />}
      {logCurveInfoList && (
        <ContentLayout>
          <ContentTable
            viewId={
              isDepthIndex
                ? "depthLogCurveInfoListView"
                : "timeLogCurveInfoListView"
            }
            panelElements={panelElements}
            columns={columns}
            data={getTableData(
              logObjects,
              logCurveInfoList,
              logObjectMap,
              undefined,
              timeZone,
              dateTimeFormat,
              curveThreshold,
              isDepthIndex
            )}
            checkableRows={true}
            stickyLeftColumns={3}
            onRowSelectionChange={(rows) =>
              updateSelectedRows(rows as LogCurveInfoRow[])
            }
            showRefresh={false}
            autoRefresh={false}
          />
        </ContentLayout>
      )}
    </>
  );
};

const StyledAutocomplete = styled(Autocomplete)<{ colors: Colors }>`
  button {
    color: ${(props) => props.colors.infographic.primaryMossGreen};
  }
  label {
    color: ${(props) => props.colors.text.staticTextLabel};
  }
  min-width: 10vw;
`;

const ContentLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 89vh;
`;

export default MultiLogCurveSelectionList;
