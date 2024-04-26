import { Switch, Typography } from "@equinor/eds-core-react";
import { ContentTable, ContentTableRow } from "components/ContentViews/table";
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
import LogCurveInfo from "models/logCurveInfo";
import { ObjectType } from "models/objectType";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { truncateAbortHandler } from "services/apiClient";
import LogCurvePriorityService from "services/logCurvePriorityService";
import { columns, getTableData } from "./LogCurveInfoListViewUtils";
import { useCurveThreshold } from "contexts/curveThresholdContext";
import LogObject from "models/logObject";

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
  const { wellUid, wellboreUid, logType } = useParams();
  const { connectedServer } = useConnectedServer();
  const [searchParams] = useSearchParams();
  const logsSearchParams = searchParams.get("logs");
  const { servers } = useGetServers();

  const getLogsFromSearchParams = (logsSearchParams: string) => {
    return JSON.parse(logsSearchParams) as string[];
  };

  const loadLogs = (): Map<string, object> => {
    const result = new Map<string, object>();
    getLogsFromSearchParams(logsSearchParams).forEach((value) => {
      if (!result.get(value)) {
        const log = useGetObject(
          connectedServer,
          wellUid,
          wellboreUid,
          ObjectType.Log,
          value
        );
        result.set(value, log);
      }
    });
    return result;
  };

  const logObjects = loadLogs();

  const { mnemonics: logCurveInfoList, isFetching: isFetchingLogCurveInfo } =
    useGetSeveralLogsMnemonics(
      wellUid,
      wellboreUid,
      getLogsFromSearchParams(logsSearchParams)
    );

  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const isFetching = isFetchingLogCurveInfo;

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log, logType);

  const [hideEmptyMnemonics, setHideEmptyMnemonics] = useState<boolean>(false);
  const [showOnlyPrioritizedCurves, setShowOnlyPrioritizedCurves] =
    useState<boolean>(false);
  const [prioritizedCurves, setPrioritizedCurves] = useState<string[]>([]);

  useEffect(() => {
    if (wellUid) {
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
  }, [wellUid]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    selectedItem: LogCurveInfoRow,
    checkedLogCurveInfoRows: LogCurveInfoRow[]
  ) => {
    const selectedLog = logObjects.get(selectedItem.logUid) as LogObject;
    const disableMenuItem = true;
    const contextMenuProps: LogCurveInfoContextMenuProps = {
      checkedLogCurveInfoRows,
      dispatchOperation,
      selectedLog: selectedLog,
      selectedServer: connectedServer,
      servers,
      prioritizedCurves,
      setPrioritizedCurves,
      disableMenuItem
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
