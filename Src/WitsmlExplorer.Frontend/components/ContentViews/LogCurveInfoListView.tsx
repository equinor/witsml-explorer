import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObjectService from "../../services/logObjectService";
import { truncateAbortHandler } from "../../services/apiClient";
import LogCurveInfoContextMenu, { LogCurveInfoContextMenuProps } from "../ContextMenus/LogCurveInfoContextMenu";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { timeFromMinutesToMilliseconds } from "../../contexts/curveThreshold";

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
  const { selectedServer, selectedWell, selectedWellbore, selectedLog, selectedCurveThreshold } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [logCurveInfoList, setLogCurveInfoList] = useState<LogCurveInfo[]>([]);
  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedLog) {
      const controller = new AbortController();

      const getLogCurveInfo = async () => {
        const logCurveInfo = await LogObjectService.getLogCurveInfo(selectedWell.uid, selectedWellbore.uid, selectedLog.uid, controller.signal);
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
    const contextMenuProps: LogCurveInfoContextMenuProps = { checkedLogCurveInfoRows, dispatchOperation, dispatchNavigation, selectedLog, selectedServer };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogCurveInfoContextMenu {...contextMenuProps} />, position } });
  };

  const calculateIsCurveActive = (logCurveInfo: LogCurveInfo, maxDepth: number): boolean => {
    if (isDepthIndex) {
      return maxDepth - logCurveInfo.maxDepthIndex < selectedCurveThreshold.depthInMeters;
    } else {
      const dateDifferenceInMilliseconds = new Date().valueOf() - new Date(logCurveInfo.maxDateTimeIndex).valueOf();
      return dateDifferenceInMilliseconds < timeFromMinutesToMilliseconds(selectedCurveThreshold.timeInMinutes);
    }
  };

  const getTableDate = () => {
    const maxDepth = Math.max(...logCurveInfoList.map((x) => x.maxDepthIndex));

    return logCurveInfoList.map((logCurveInfo) => {
      return {
        id: `${selectedLog.uid}-${logCurveInfo.mnemonic}`,
        uid: logCurveInfo.uid,
        mnemonic: logCurveInfo.mnemonic,
        minIndex: isDepthIndex ? logCurveInfo.minDepthIndex : logCurveInfo.minDateTimeIndex,
        maxIndex: isDepthIndex ? logCurveInfo.maxDepthIndex : logCurveInfo.maxDateTimeIndex,
        classWitsml: logCurveInfo.classWitsml,
        unit: logCurveInfo.unit,
        mnemAlias: logCurveInfo.mnemAlias,
        logUid: selectedLog.uid,
        wellUid: selectedWell.uid,
        wellboreUid: selectedWellbore.uid,
        wellName: selectedWell.name,
        wellboreName: selectedWellbore.name,
        isActive: selectedLog.objectGrowing && calculateIsCurveActive(logCurveInfo, maxDepth)
      };
    });
  };

  const columns: ContentTableColumn[] = [
    !isDepthIndex && { property: "isActive", label: "Active", type: ContentType.Icon },
    { property: "mnemonic", label: "Mnemonic", type: ContentType.String },
    { property: "minIndex", label: "MinIndex", type: isDepthIndex ? ContentType.Number : ContentType.DateTime },
    { property: "maxIndex", label: "MaxIndex", type: isDepthIndex ? ContentType.Number : ContentType.DateTime },
    { property: "classWitsml", label: "ClassWitsml", type: ContentType.String },
    { property: "unit", label: "Unit", type: ContentType.String },
    { property: "mnemAlias", label: "MnemAlias", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  return selectedLog && !isFetchingData ? <ContentTable columns={columns} data={getTableDate()} onContextMenu={onContextMenu} checkableRows /> : <></>;
};

export default LogCurveInfoListView;
