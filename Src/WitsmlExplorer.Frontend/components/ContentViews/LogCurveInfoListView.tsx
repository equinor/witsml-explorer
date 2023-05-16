import React, { useContext, useEffect, useState } from "react";
import { timeFromMinutesToMilliseconds } from "../../contexts/curveThreshold";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { measureToString } from "../../models/measure";
import { truncateAbortHandler } from "../../services/apiClient";
import ComponentService from "../../services/componentService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import LogCurveInfoContextMenu, { LogCurveInfoContextMenuProps } from "../ContextMenus/LogCurveInfoContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

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
}

export const LogCurveInfoListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const { selectedServer, selectedWell, selectedWellbore, selectedObject, selectedCurveThreshold, servers } = navigationState;
  const selectedLog = selectedObject as LogObject;
  const { dispatchOperation } = useContext(OperationContext);
  const [logCurveInfoList, setLogCurveInfoList] = useState<LogCurveInfo[]>([]);
  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedLog) {
      const controller = new AbortController();

      const getLogCurveInfo = async () => {
        const logCurveInfo = await ComponentService.getComponents(selectedWell.uid, selectedWellbore.uid, selectedLog.uid, ComponentType.Mnemonic, undefined, controller.signal);
        setLogCurveInfoList(logCurveInfo);
        setIsFetchingData(false);
      };

      getLogCurveInfo().catch(truncateAbortHandler);

      return () => {
        controller.abort();
      };
    }
  }, [selectedLog]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedLogCurveInfoRows: LogCurveInfoRow[]) => {
    const contextMenuProps: LogCurveInfoContextMenuProps = { checkedLogCurveInfoRows, dispatchOperation, dispatchNavigation, selectedLog, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogCurveInfoContextMenu {...contextMenuProps} />, position } });
  };

  const calculateIsCurveActive = (logCurveInfo: LogCurveInfo, maxDepth: number): boolean => {
    if (isDepthIndex) {
      return maxDepth - parseFloat(logCurveInfo.maxDepthIndex) < selectedCurveThreshold.depthInMeters;
    } else {
      const dateDifferenceInMilliseconds = new Date().valueOf() - new Date(logCurveInfo.maxDateTimeIndex).valueOf();
      return dateDifferenceInMilliseconds < timeFromMinutesToMilliseconds(selectedCurveThreshold.timeInMinutes);
    }
  };

  const getTableData = () => {
    const maxDepth = Math.max(...logCurveInfoList.map((x) => parseFloat(x.maxDepthIndex)));
    return logCurveInfoList
      .map((logCurveInfo) => {
        const isActive = selectedLog.objectGrowing && calculateIsCurveActive(logCurveInfo, maxDepth);
        return {
          id: `${selectedLog.uid}-${logCurveInfo.mnemonic}`,
          uid: logCurveInfo.uid,
          mnemonic: logCurveInfo.mnemonic,
          minIndex: isDepthIndex ? logCurveInfo.minDepthIndex : formatDateString(logCurveInfo.minDateTimeIndex, timeZone),
          maxIndex: isDepthIndex ? logCurveInfo.maxDepthIndex : formatDateString(logCurveInfo.maxDateTimeIndex, timeZone),
          classWitsml: logCurveInfo.classWitsml,
          unit: logCurveInfo.unit,
          sensorOffset: measureToString(logCurveInfo.sensorOffset),
          mnemAlias: logCurveInfo.mnemAlias,
          logUid: selectedLog.uid,
          wellUid: selectedWell.uid,
          wellboreUid: selectedWellbore.uid,
          wellName: selectedWell.name,
          wellboreName: selectedWellbore.name,
          isActive: isActive,
          isVisibleFunction: isVisibleFunction(isActive)
        };
      })
      .sort((curve, curve2) => {
        if (curve.mnemonic.toLowerCase() === selectedLog.indexCurve?.toLowerCase()) {
          return -1;
        } else if (curve2.mnemonic.toLowerCase() === selectedLog.indexCurve?.toLowerCase()) {
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
    !isDepthIndex && { property: "isActive", label: "active", type: ContentType.Icon },
    { property: "mnemonic", label: "mnemonic", type: ContentType.String },
    { property: "minIndex", label: "minIndex", type: isDepthIndex ? ContentType.Number : ContentType.DateTime },
    { property: "maxIndex", label: "maxIndex", type: isDepthIndex ? ContentType.Number : ContentType.DateTime },
    { property: "classWitsml", label: "classWitsml", type: ContentType.String },
    { property: "unit", label: "unit", type: ContentType.String },
    { property: "sensorOffset", label: "sensorOffset", type: ContentType.Number },
    { property: "mnemAlias", label: "mnemAlias", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  return selectedLog && !isFetchingData ? <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows /> : <></>;
};

export default LogCurveInfoListView;
