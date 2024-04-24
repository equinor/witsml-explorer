import { Switch, Typography } from "@equinor/eds-core-react";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import LogCurveInfoContextMenu, {
  LogCurveInfoContextMenuProps
} from "components/ContextMenus/LogCurveInfoContextMenu";

import ProgressSpinner from "components/ProgressSpinner";
import { CommonPanelContainer } from "components/StyledComponents/Container";
import { useConnectedServer } from "contexts/connectedServerContext";

import OperationContext from "contexts/operationContext";
import { UserTheme } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetObject } from "hooks/query/useGetObject";
import { useGetServers } from "hooks/query/useGetServers";
import { useGetSeveralLogsMnemonics } from "hooks/query/useGetSeveralLogsMnemonics";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import LogCurveInfo, { isNullOrEmptyIndex } from "models/logCurveInfo";
import LogObject from "models/logObject";

import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import { truncateAbortHandler } from "services/apiClient";
import LogCurvePriorityService from "services/logCurvePriorityService";
import { getTableData } from "./LogCurveInfoListViewUtils";
import { useCurveThreshold } from "contexts/curveThresholdContext";


export interface LogCurveInfoRow extends ContentTableRow {
  uid: string;
  mnemonic: string;
  minIndex: number | Date;
  maxIndex: number | Date;
  classWitsml: string;
  unit: string;
  mnemAlias: string;
  logUid: string;
  wellUid: string;
  wellboreUid: string;
  wellName: string;
  wellboreName: string;
  isActive: boolean;
  logCurveInfo: LogCurveInfo;
}

export default function SelectedLogsCurveInfoListView() {
  const { curveThreshold } = useCurveThreshold();
  const {
    operationState: { timeZone, dateTimeFormat, theme }
  } = useContext(OperationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { wellUid, wellboreUid, logType, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const [searchParams] = useSearchParams();
  const logsSearchParams = searchParams.get("logs");
  const { servers } = useGetServers();
  const {
    object: logObject,
    isFetching: isFetchingLog,
    isFetched: isFetchedLog
  } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Log,
    objectUid
  );

  const geLogsFromSearchParams = (logsSearchParams: string) => {
    return JSON.parse(logsSearchParams) as string[];
  };

  const loadLogs = (): Map<string, object> => {
    const result = new Map<string, object>();
    geLogsFromSearchParams(logsSearchParams).forEach((value) => {

      if (!result.get(value)) {
        const log = useGetObject(connectedServer,
          wellUid,
          wellboreUid,
          ObjectType.Log,
          value
        )
        result.set(value, log);
      }
    });
    return result;
  };

  const logObjects = loadLogs();

  const { mnemonics: logCurveInfoList, isFetching: isFetchingLogCurveInfo } = useGetSeveralLogsMnemonics(
    wellUid,
    wellboreUid,
    geLogsFromSearchParams(logsSearchParams),
  );

  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const isFetching = isFetchingLog || isFetchingLogCurveInfo;

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log, logType);

  const [hideEmptyMnemonics, setHideEmptyMnemonics] = useState<boolean>(false);
  const [showOnlyPrioritizedCurves, setShowOnlyPrioritizedCurves] =
    useState<boolean>(false);
  const [prioritizedCurves, setPrioritizedCurves] = useState<string[]>([]);

  useEffect(() => {
    if (logObject) {
      const getLogCurvePriority = async () => {
        const prioritizedCurves =
          await LogCurvePriorityService.getPrioritizedCurves(
            wellUid,
            wellboreUid
          );
        setPrioritizedCurves(prioritizedCurves);
      };

      getLogCurvePriority().catch(truncateAbortHandler);
      setShowOnlyPrioritizedCurves(false);
    }
  }, [logObject]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    { },
    checkedLogCurveInfoRows: LogCurveInfoRow[]
  ) => {
    const contextMenuProps: LogCurveInfoContextMenuProps = {
      checkedLogCurveInfoRows,
      dispatchOperation,
      selectedLog: logObject,
      selectedServer: connectedServer,
      servers,
      prioritizedCurves,
      setPrioritizedCurves
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <LogCurveInfoContextMenu {...contextMenuProps} />,
        position
      }
    });
  };






  const columns: ContentTableColumn[] = [
    ...(!isDepthIndex
      ? [{ property: "isActive", label: "active", type: ContentType.String }]
      : []),
    {
      property: "mnemonic",
      label: "mnemonic",
      type: ContentType.String,
      filterFn: (row) => {
        return (
          !showOnlyPrioritizedCurves ||
          prioritizedCurves.includes(row.original.mnemonic) ||
          row.original.mnemonic === (logObjects.get(row.original.logUid) as LogObject).indexCurve // Always show index curve
        );
      }
    },
    { property: "logUid", label: "logUid", type: ContentType.String },
    {
      property: "minIndex",
      label: "minIndex",
      type: isDepthIndex ? ContentType.Number : ContentType.DateTime,
      filterFn: (row) => {
        return (
          !hideEmptyMnemonics || !isNullOrEmptyIndex(row.original.minIndex)
        );
      }
    },
    {
      property: "maxIndex",
      label: "maxIndex",
      type: isDepthIndex ? ContentType.Number : ContentType.DateTime
    },
    { property: "classWitsml", label: "classWitsml", type: ContentType.String },
    { property: "unit", label: "unit", type: ContentType.String },
    {
      property: "sensorOffset",
      label: "sensorOffset",
      type: ContentType.Measure
    },
    { property: "mnemAlias", label: "mnemAlias", type: ContentType.String },
    { property: "traceState", label: "traceState", type: ContentType.String },
    { property: "nullValue", label: "nullValue", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  if (isFetching) {
    return <ProgressSpinner message={`Fetching Log.`} />;
  }

  if (isFetchedLog && !logObject) {
    return <ItemNotFound itemType={ObjectType.Log} />;
  }

  const panelElements = [
    <CommonPanelContainer key="hideEmptyMnemonics">
      <Switch
        checked={hideEmptyMnemonics}
        onChange={() => setHideEmptyMnemonics(!hideEmptyMnemonics)}
        size={theme === UserTheme.Compact ? "small" : "default"}
      />
      <Typography>Hide Empty Curves</Typography>
    </CommonPanelContainer>,
    <CommonPanelContainer key="showPriority">
      <Switch
        checked={showOnlyPrioritizedCurves}
        disabled={prioritizedCurves.length === 0 && !showOnlyPrioritizedCurves}
        onChange={() =>
          setShowOnlyPrioritizedCurves(!showOnlyPrioritizedCurves)
        }
        size={theme === UserTheme.Compact ? "small" : "default"}
      />
      <Typography>Show Only Prioritized Curves</Typography>
    </CommonPanelContainer>
  ];

  return (
    logObjects && logCurveInfoList && (
      <ContentTable
        viewId={
          isDepthIndex
            ? "depthLogCurveInfoListView"
            : "timeLogCurveInfoListView"
        }
        panelElements={panelElements}
        columns={columns}
        data={getTableData(logCurveInfoList, logObjects, timeZone, dateTimeFormat, curveThreshold, true)}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName={`LogCurveInfo_${logsSearchParams}`}
      />
    )
  );
}
