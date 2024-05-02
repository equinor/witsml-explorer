import { Switch, Typography } from "@equinor/eds-core-react";
import { ContentTable } from "components/ContentViews/table";
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
import { useGetServers } from "hooks/query/useGetServers";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import LogCurveInfo from "models/logCurveInfo";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  LogCurveInfoRow,
  columns,
  getTableData
} from "./LogCurveInfoListViewUtils";
import { useCurveThreshold } from "contexts/curveThresholdContext";
import LogObject from "models/logObject";
import { useGetObjects } from "hooks/query/useGetObjects";
import LogObjectService from "services/logObjectService";
import LogCurvePriorityService from "services/logCurvePriorityService";
import { truncateAbortHandler } from "services/apiClient";

export default function MultiLogsCurveInfoListView() {
  const { curveThreshold } = useCurveThreshold();
  const {
    operationState: { timeZone, dateTimeFormat, theme }
  } = useContext(OperationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { wellUid, wellboreUid, logType } = useParams();
  const { connectedServer } = useConnectedServer();
  const [logCurveInfoList, setLogCurveInfoList] = useState<LogCurveInfo[]>();
  const [logObjects, setLogObjects] = useState<Map<string, LogObject>>();
  const [isFetchingMnemonics, setIsFetchingMnemonics] = useState<boolean>();
  const [searchParams] = useSearchParams();
  const logsSearchParams = searchParams.get("logs");
  const { servers } = useGetServers();

  const { objects: allLogs, isFetching: isFetchingLogs } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Log
  );

  const getLogsFromSearchParams = (logsSearchParams: string) => {
    return JSON.parse(logsSearchParams) as string[];
  };

  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const isFetching = isFetchingLogs || isFetchingMnemonics;

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log, logType);

  const [hideEmptyMnemonics, setHideEmptyMnemonics] = useState<boolean>(false);
  const [showOnlyPrioritizedCurves, setShowOnlyPrioritizedCurves] =
    useState<boolean>(false);
  const [prioritizedCurves, setPrioritizedCurves] = useState<string[]>([]);

  useEffect(() => {
    if (allLogs) {
      const result = new Map<string, LogObject>();
      getLogsFromSearchParams(logsSearchParams).forEach((value) => {
        if (!result.get(value)) {
          const log = allLogs.find((x) => x.uid === value);
          result.set(value, log);
        }
      });
      setLogObjects(result);

      const getMnemonics = async () => {
        setIsFetchingMnemonics(true);
        const mnemonics = await LogObjectService.getMnemonicsInLogs(
          wellUid,
          wellboreUid,
          getLogsFromSearchParams(logsSearchParams),
          new AbortController().signal
        );
        setLogCurveInfoList(mnemonics);
        setIsFetchingMnemonics(false);
      };
      getMnemonics();

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
  }, [allLogs]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    selectedItem: LogCurveInfoRow,
    checkedLogCurveInfoRows: LogCurveInfoRow[]
  ) => {
    const selectedLog = logObjects.get(selectedItem.logUid);
    const isMultiLog = true;
    const contextMenuProps: LogCurveInfoContextMenuProps = {
      checkedLogCurveInfoRows,
      dispatchOperation,
      selectedLog: selectedLog,
      selectedServer: connectedServer,
      servers,
      prioritizedCurves,
      setPrioritizedCurves,
      isMultiLog
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

  if (isFetching) {
    return <ProgressSpinner message={`Fetching Logs.`} />;
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
    logObjects &&
    logCurveInfoList && (
      <ContentTable
        viewId={
          isDepthIndex
            ? "depthLogCurveInfoListView"
            : "timeLogCurveInfoListView"
        }
        panelElements={panelElements}
        columns={columns(
          isDepthIndex,
          showOnlyPrioritizedCurves,
          prioritizedCurves,
          logObjects,
          hideEmptyMnemonics
        )}
        data={getTableData(
          logCurveInfoList,
          logObjects,
          timeZone,
          dateTimeFormat,
          curveThreshold
        )}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName={`LogCurveInfo_${logsSearchParams
          .replace("[", "")
          .replace("]", "")}`}
      />
    )
  );
}
