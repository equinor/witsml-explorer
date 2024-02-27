import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { useConnectedServer } from "../../contexts/connectedServerContext";
import {
  timeFromMinutesToMilliseconds,
  useCurveThreshold
} from "../../contexts/curveThresholdContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetComponents } from "../../hooks/query/useGetComponents";
import { useGetObject } from "../../hooks/query/useGetObject";
import { useGetServers } from "../../hooks/query/useGetServers";
import { useGetWell } from "../../hooks/query/useGetWell";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { ComponentType } from "../../models/componentType";
import LogCurveInfo from "../../models/logCurveInfo";
import { measureToString } from "../../models/measure";
import { ObjectType } from "../../models/objectType";
import { ItemNotFound } from "../../routes/ItemNotFound";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import LogCurveInfoContextMenu, {
  LogCurveInfoContextMenuProps
} from "../ContextMenus/LogCurveInfoContextMenu";
import formatDateString from "../DateFormatter";
import ProgressSpinner from "../ProgressSpinner";
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
  const { curveThreshold } = useCurveThreshold();
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const { wellUid, wellboreUid, logType, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { servers } = useGetServers();
  const { well, isFetching: isFetchingWell } = useGetWell(
    connectedServer,
    wellUid
  );
  const { wellbore, isFetching: isFetchingWellbore } = useGetWellbore(
    connectedServer,
    wellUid,
    wellboreUid
  );
  const { object: logObject, isFetching: isFetchingLog } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.Log,
    objectUid
  );
  const { components: logCurveInfoList, isFetching: isFetchingLogCurveInfo } =
    useGetComponents(
      connectedServer,
      wellUid,
      wellboreUid,
      objectUid,
      ComponentType.Mnemonic
    );
  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;
  const isFetching =
    isFetchingWell ||
    isFetchingWellbore ||
    isFetchingLog ||
    isFetchingLogCurveInfo;

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Log, logType);

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
      selectedWell: well,
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
        curveThreshold.depthInMeters
      );
    } else {
      const dateDifferenceInMilliseconds =
        new Date().valueOf() -
        new Date(logCurveInfo.maxDateTimeIndex).valueOf();
      return (
        dateDifferenceInMilliseconds <
        timeFromMinutesToMilliseconds(curveThreshold.timeInMinutes)
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
      return !(curveThreshold.hideInactiveCurves && !isActive);
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

  if (isFetching) {
    return <ProgressSpinner message={`Fetching Log.`} />;
  }

  if (!isFetchingLog && !logObject) {
    return <ItemNotFound itemType={ObjectType.Log} />;
  }

  return (
    <ContentTable
      viewId={
        isDepthIndex ? "depthLogCurveInfoListView" : "timeLogCurveInfoListView"
      }
      columns={columns}
      data={getTableData()}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName={`LogCurveInfo_${logObject.name}`}
    />
  );
}
