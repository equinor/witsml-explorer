import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { timeFromMinutesToMilliseconds } from "../../contexts/curveThreshold";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { ComponentType } from "../../models/componentType";
import LogCurveInfo from "../../models/logCurveInfo";
import LogObject from "../../models/logObject";
import { measureToString } from "../../models/measure";
import { ObjectType } from "../../models/objectType";
import { truncateAbortHandler } from "../../services/apiClient";
import ComponentService from "../../services/componentService";
import ObjectService from "../../services/objectService";
import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "../Constants";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import LogCurveInfoContextMenu, {
  LogCurveInfoContextMenuProps
} from "../ContextMenus/LogCurveInfoContextMenu";
import formatDateString from "../DateFormatter";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

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

export default function LogCurveInfoListView() {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const {
    selectedServer,
    selectedWell,
    selectedObject,
    selectedCurveThreshold,
    servers
  } = navigationState;
  const selectedLog = selectedObject as LogObject;
  const { dispatchOperation } = useContext(OperationContext);
  const [logCurveInfoList, setLogCurveInfoList] = useState<LogCurveInfo[]>([]);
  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const { wellUid, wellboreUid, logType, objectUid } = useParams();
  const [logObject, setLogObject] = useState<LogObject>(null);
  const { authorizationState } = useAuthorizationState();
  const { wellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );

  useExpandSidebarNodes(
    wellUid,
    wellboreUid,
    ObjectType.Log,
    logType === "depth" ? WITSML_INDEX_TYPE_MD : WITSML_INDEX_TYPE_DATE_TIME
  );

  useEffect(() => {
    setIsFetchingData(true);
    // TODO: Clean up this useEffect
    // const controller = new AbortController();

    const getLogCurveInfo = async () => {
      const logCurveInfo = await ComponentService.getComponents(
        wellUid,
        wellboreUid,
        objectUid,
        ComponentType.Mnemonic,
        undefined
        // controller.signal
      );
      setLogCurveInfoList(logCurveInfo);

      const fetchedLogObject = await ObjectService.getObject(
        wellUid,
        wellboreUid,
        objectUid,
        ObjectType.Log
      );
      setLogObject(fetchedLogObject);

      setIsFetchingData(false);
    };

    // getLogCurveInfo().catch(truncateAbortHandler);
    getLogCurveInfo().catch(truncateAbortHandler);

    // return () => {
    //   controller.abort();
    // };
  }, [wellUid, wellboreUid, logType, objectUid]);

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
      selectedWell,
      selectedWellbore: wellbore,
      servers
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
          logObject.objectGrowing &&
          calculateIsCurveActive(logCurveInfo, maxDepth);
        return {
          id: `${objectUid}-${logCurveInfo.mnemonic}`,
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
          logUid: objectUid,
          wellUid: logObject.wellUid,
          wellboreUid: logObject.wellboreUid,
          wellName: logObject.wellName,
          wellboreName: logObject.wellboreName,
          isActive: isActive,
          isVisibleFunction: isVisibleFunction(isActive),
          logCurveInfo
        };
      })
      .sort((curve, curve2) => {
        if (
          curve.mnemonic.toLowerCase() === logObject.indexCurve?.toLowerCase()
        ) {
          return -1;
        } else if (
          curve2.mnemonic.toLowerCase() === logObject.indexCurve?.toLowerCase()
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
    { property: "mnemonic", label: "mnemonic", type: ContentType.String },
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
    { property: "classWitsml", label: "classWitsml", type: ContentType.String },
    { property: "unit", label: "unit", type: ContentType.String },
    {
      property: "sensorOffset",
      label: "sensorOffset",
      type: ContentType.Measure
    },
    { property: "mnemAlias", label: "mnemAlias", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  return (
    !isFetchingData && (
      <ContentTable
        viewId={
          isDepthIndex
            ? "depthLogCurveInfoListView"
            : "timeLogCurveInfoListView"
        }
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        // TODO: Fix downloadToCsvFileName, removed selectedLog.name
        // downloadToCsvFileName={`LogCurveInfo_${selectedLog.name}`}
        downloadToCsvFileName={`LogCurveInfo_${objectUid}`}
      />
    )
  );
}
