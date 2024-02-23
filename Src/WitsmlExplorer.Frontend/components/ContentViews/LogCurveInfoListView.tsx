import { Switch, Typography } from "@equinor/eds-core-react";
import { CommonPanelContainer } from "components/StyledComponents/Container";
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
import formatDateString from "components/DateFormatter";
import { timeFromMinutesToMilliseconds } from "contexts/curveThreshold";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import LogCurveInfo, { isNullOrEmptyIndex } from "models/logCurveInfo";
import LogObject from "models/logObject";
import { measureToString } from "models/measure";
import React, { useContext, useEffect, useState } from "react";
import { truncateAbortHandler } from "services/apiClient";
import ComponentService from "services/componentService";
import LogCurvePriorityService from "services/logCurvePriorityService";

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
export const LogCurveInfoListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const {
    selectedServer,
    selectedWell,
    selectedWellbore,
    selectedObject,
    selectedCurveThreshold,
    servers
  } = navigationState;
  const selectedLog = selectedObject as LogObject;
  const { dispatchOperation } = useContext(OperationContext);
  const [logCurveInfoList, setLogCurveInfoList] = useState<LogCurveInfo[]>([]);
  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [hideEmptyMnemonics, setHideEmptyMnemonics] = useState<boolean>(false);
  const [showOnlyPrioritizedCurves, setShowOnlyPrioritizedCurves] =
    useState<boolean>(false);
  const [prioritizedCurves, setPrioritizedCurves] = useState<string[]>([]);

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedLog) {
      const controller = new AbortController();

      const getLogCurveInfo = async () => {
        const logCurveInfo = await ComponentService.getComponents(
          selectedWell.uid,
          selectedWellbore.uid,
          selectedLog.uid,
          ComponentType.Mnemonic,
          undefined,
          controller.signal
        );
        setLogCurveInfoList(logCurveInfo);
        setIsFetchingData(false);
      };

      const getLogCurvePriority = async () => {
        const prioritizedCurves =
          await LogCurvePriorityService.getPrioritizedCurves(
            selectedWell.uid,
            selectedWellbore.uid,
            controller.signal
          );
        setPrioritizedCurves(prioritizedCurves);
      };

      getLogCurveInfo().catch(truncateAbortHandler);
      getLogCurvePriority().catch(truncateAbortHandler);
      setShowOnlyPrioritizedCurves(false);

      return () => {
        controller.abort();
      };
    }
  }, [selectedLog]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedLogCurveInfoRows: LogCurveInfoRow[]
  ) => {
    const contextMenuProps: LogCurveInfoContextMenuProps = {
      checkedLogCurveInfoRows,
      dispatchOperation,
      dispatchNavigation,
      selectedLog,
      selectedServer,
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

  const calculateIsCurveActive = (
    logCurveInfo: LogCurveInfo,
    maxDepth: number
  ): boolean => {
    if (isDepthIndex) {
      return (
        maxDepth - parseFloat(logCurveInfo.maxDepthIndex) <
        selectedCurveThreshold.depthInMeters
      );
    } else {
      const dateDifferenceInMilliseconds =
        new Date().valueOf() -
        new Date(logCurveInfo.maxDateTimeIndex).valueOf();
      return (
        dateDifferenceInMilliseconds <
        timeFromMinutesToMilliseconds(selectedCurveThreshold.timeInMinutes)
      );
    }
  };

  const getTableData = () => {
    const maxDepth = Math.max(
      ...logCurveInfoList.map((x) => parseFloat(x.maxDepthIndex))
    );

    return logCurveInfoList
      .map((logCurveInfo) => {
        const isActive =
          selectedLog.objectGrowing &&
          calculateIsCurveActive(logCurveInfo, maxDepth);
        return {
          id: `${selectedLog.uid}-${logCurveInfo.mnemonic}`,
          uid: logCurveInfo.uid,
          mnemonic: logCurveInfo.mnemonic,
          minIndex: isDepthIndex
            ? logCurveInfo.minDepthIndex
            : formatDateString(
                logCurveInfo.minDateTimeIndex,
                timeZone,
                dateTimeFormat
              ),
          maxIndex: isDepthIndex
            ? logCurveInfo.maxDepthIndex
            : formatDateString(
                logCurveInfo.maxDateTimeIndex,
                timeZone,
                dateTimeFormat
              ),
          classWitsml: logCurveInfo.classWitsml,
          unit: logCurveInfo.unit,
          sensorOffset: measureToString(logCurveInfo.sensorOffset),
          mnemAlias: logCurveInfo.mnemAlias,
          traceState: logCurveInfo.traceState,
          nullValue: logCurveInfo.nullValue,
          logUid: selectedLog.uid,
          wellUid: selectedWell.uid,
          wellboreUid: selectedWellbore.uid,
          wellName: selectedWell.name,
          wellboreName: selectedWellbore.name,
          isActive: isActive,
          isVisibleFunction: isVisibleFunction(isActive),
          logCurveInfo
        };
      })
      .sort((curve, curve2) => {
        if (
          curve.mnemonic.toLowerCase() === selectedLog.indexCurve?.toLowerCase()
        ) {
          return -1;
        } else if (
          curve2.mnemonic.toLowerCase() ===
          selectedLog.indexCurve?.toLowerCase()
        ) {
          return 1;
        }
        return curve.mnemonic.localeCompare(curve2.mnemonic);
      });
  };

  const isVisibleFunction = (isActive: boolean): (() => boolean) => {
    return () => {
      if (isDepthIndex) return true;
      return !(selectedCurveThreshold.hideInactiveCurves && !isActive);
    };
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
          row.original.mnemonic === selectedLog.indexCurve // Always show index curve
        );
      }
    },
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

  const panelElements = [
    <CommonPanelContainer key="hideEmptyMnemonics">
      <Switch
        checked={hideEmptyMnemonics}
        onChange={() => setHideEmptyMnemonics(!hideEmptyMnemonics)}
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
      />
      <Typography>Show Only Prioritized Curves</Typography>
    </CommonPanelContainer>
  ];

  return selectedLog && !isFetchingData ? (
    <ContentTable
      viewId={
        isDepthIndex ? "depthLogCurveInfoListView" : "timeLogCurveInfoListView"
      }
      panelElements={panelElements}
      columns={columns}
      data={getTableData()}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName={`LogCurveInfo_${selectedLog.name}`}
    />
  ) : (
    <></>
  );
};

export default LogCurveInfoListView;
