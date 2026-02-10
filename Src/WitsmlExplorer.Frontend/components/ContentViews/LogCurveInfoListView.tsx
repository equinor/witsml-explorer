import { Switch, Typography } from "@equinor/eds-core-react";
import { ContentTable } from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import LogCurveInfoContextMenu, {
  LogCurveInfoContextMenuProps
} from "components/ContextMenus/LogCurveInfoContextMenu";
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { CommonPanelContainer } from "components/StyledComponents/Container";
import { RoleLimitedAccess } from "components/UserRoles.ts";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useCurveThreshold } from "contexts/curveThresholdContext";
import {
  DisplayModalAction,
  UserRole,
  UserTheme
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useGetServers } from "hooks/query/useGetServers";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";
import { RouterLogType } from "routes/routerConstants";
import { truncateAbortHandler } from "services/apiClient";
import LogCurvePriorityService from "services/logCurvePriorityService";
import { useGetAgentSettings } from "../../hooks/query/useGetAgentSettings.tsx";
import BaseReport from "../../models/reports/BaseReport.tsx";
import NotificationService from "../../services/notificationService.ts";
import MinimumDataQcModal, {
  MinimumDataQcModalProps
} from "../Modals/MinimumDataQcModal.tsx";
import {
  getColumns,
  getTableData,
  LogCurveInfoRow
} from "./LogCurveInfoListViewUtils";
import {
  IsQcReportJobRunning,
  LoadExistingMinQcReport
} from "./MinimumDataQcUtils.tsx";

export default function LogCurveInfoListView() {
  const { curveThreshold } = useCurveThreshold();
  const {
    operationState: { timeZone, dateTimeFormat, theme }
  } = useOperationState();
  const { dispatchOperation } = useOperationState();
  const { wellUid, wellboreUid, logType, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { servers } = useGetServers();
  const {
    object: logObject,
    isFetching: isFetchingLog,
    isFetched: isFetchedLog,
    responseTime: responseTimeObject,
    dataUpdatedAt: dataUpdatedAtObject
  } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Log,
    objectUid
  );

  const { agentSettings } = useGetAgentSettings();

  const {
    components: logCurveInfoList,
    isFetching: isFetchingLogCurveInfo,
    responseTime: responseTimeComponents,
    dataUpdatedAt: dataUpdatedAtComponents
  } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.Mnemonic
  );
  const [hideEmptyMnemonics, setHideEmptyMnemonics] = useState<boolean>(false);
  const [showOnlyPrioritizedCurves, setShowOnlyPrioritizedCurves] =
    useState<boolean>(false);
  const [showMinimumDataQc, setShowMinimumDataQc] = useState<boolean>(false);
  const [minimumDataQcReport, setMinimumDataQcReport] =
    useState<BaseReport>(undefined);
  const [prioritizedLocalCurves, setPrioritizedLocalCurves] = useState<
    string[]
  >([]);
  const [prioritizedUniversalCurves, setPrioritizedUniversalCurves] = useState<
    string[]
  >([]);
  const logObjects = new Map<string, LogObject>([[objectUid, logObject]]);
  const isDepthIndex = logType === RouterLogType.DEPTH;
  const isFetching = isFetchingLog || isFetchingLogCurveInfo;
  const responseTime = isFetching
    ? 0
    : Math.max(responseTimeObject, responseTimeComponents);
  const dataUpdatedAt = Math.max(dataUpdatedAtObject ?? 0, dataUpdatedAtComponents ?? 0);
  const lastFetched = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "";
  const allPrioritizedCurves = [
    ...prioritizedLocalCurves,
    ...prioritizedUniversalCurves
  ].filter((value, index, self) => self.indexOf(value) === index);

  useExpandSidebarNodes(
    wellUid,
    wellboreUid,
    ObjectType.Log,
    logType,
    logObject?.name
  );

  useEffect(() => {
    if (logObject) {
      const getLogCurveLocalPriority = async () => {
        const prioritizedCurves =
          await LogCurvePriorityService.getPrioritizedCurves(
            false,
            wellUid,
            wellboreUid
          );
        setPrioritizedLocalCurves(prioritizedCurves);
      };

      const getLogCurveUniversalPriority = async () => {
        const prioritizedCurves =
          await LogCurvePriorityService.getPrioritizedCurves(true);
        setPrioritizedUniversalCurves(prioritizedCurves);
      };

      getLogCurveLocalPriority().catch(truncateAbortHandler);
      getLogCurveUniversalPriority().catch(truncateAbortHandler);
      setShowOnlyPrioritizedCurves(false);
    }
  }, [logObject]);

  const handleMinimumDataQcSwitchChange = async () => {
    if (!allPrioritizedCurves && allPrioritizedCurves.length == 0) {
      NotificationService.Instance.alertDispatcher.dispatch({
        serverUrl: new URL(connectedServer.url),
        message: "No prioritized curves set!",
        isSuccess: false,
        severity: "info"
      });
    }

    if (!showMinimumDataQc) {
      if (await IsQcReportJobRunning(logObject.name)) {
        NotificationService.Instance.alertDispatcher.dispatch({
          serverUrl: new URL(connectedServer.url),
          message: "Minimum data QC job already running!",
          isSuccess: false,
          severity: "info"
        });
        return;
      }

      const report = await LoadExistingMinQcReport(
        logObject.name,
        agentSettings?.minimumDataQcTimeoutDefault
      );

      if (report) {
        setShowMinimumDataQc(true);
        setMinimumDataQcReport(report);
      } else {
        const minimumDataQcModalProps: MinimumDataQcModalProps = {
          logObject: logObject,
          mnemonics: allPrioritizedCurves
        };

        const action: DisplayModalAction = {
          type: OperationType.DisplayModal,
          payload: <MinimumDataQcModal {...minimumDataQcModalProps} />
        };

        dispatchOperation(action);
      }
    } else {
      setShowMinimumDataQc(false);
    }
  };

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedLogCurveInfoRows: LogCurveInfoRow[]
  ) => {
    const contextMenuProps: LogCurveInfoContextMenuProps = {
      checkedLogCurveInfoRows,
      dispatchOperation,
      selectedLog: logObject,
      selectedServer: connectedServer,
      servers,
      prioritizedLocalCurves,
      setPrioritizedLocalCurves,
      prioritizedUniversalCurves,
      setPrioritizedUniversalCurves
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
    <RoleLimitedAccess requiredRole={UserRole.Advanced} key="showPriority">
      <CommonPanelContainer>
        <Switch
          checked={showOnlyPrioritizedCurves}
          disabled={
            allPrioritizedCurves.length === 0 && !showOnlyPrioritizedCurves
          }
          onChange={() =>
            setShowOnlyPrioritizedCurves(!showOnlyPrioritizedCurves)
          }
          size={theme === UserTheme.Compact ? "small" : "default"}
        />
        <Typography>Show Only Prioritized Curves</Typography>
      </CommonPanelContainer>
    </RoleLimitedAccess>,
    <RoleLimitedAccess requiredRole={UserRole.Advanced} key="showMinimumDataQc">
      <CommonPanelContainer>
        <Switch
          checked={showMinimumDataQc}
          disabled={
            allPrioritizedCurves.length === 0 && !showOnlyPrioritizedCurves
          }
          onChange={handleMinimumDataQcSwitchChange}
          size={theme === UserTheme.Compact ? "small" : "default"}
        />
        <Typography>Show Minimum Data QC</Typography>
      </CommonPanelContainer>
    </RoleLimitedAccess>
  ];

  return (
    <>
      {isFetching && <ProgressSpinnerOverlay message={`Fetching Log.`} />}
      {logObject && (
        <ContentTable
          viewId={
            isDepthIndex
              ? "depthLogCurveInfoListView"
              : "timeLogCurveInfoListView"
          }
          panelElements={panelElements}
          columns={getColumns(
            isDepthIndex,
            showOnlyPrioritizedCurves,
            showMinimumDataQc,
            allPrioritizedCurves,
            logObjects,
            hideEmptyMnemonics,
            true
          )}
          data={getTableData(
            [logObject],
            logCurveInfoList,
            logObjects,
            minimumDataQcReport,
            timeZone,
            dateTimeFormat,
            curveThreshold,
            isDepthIndex,
            objectUid
          )}
          onContextMenu={onContextMenu}
          checkableRows
          showRefresh
          downloadToCsvFileName={`LogCurveInfo_${logObject.name}`}
          responseTime={responseTime}
          lastFetched={lastFetched}
        />
      )}
    </>
  );
}
