import formatDateString from "components/DateFormatter";
import {
  timeFromMinutesToMilliseconds,
  CurveThreshold
} from "contexts/curveThresholdContext";
import { DateTimeFormat, TimeZone } from "contexts/operationStateReducer";
import LogCurveInfo, { isNullOrEmptyIndex } from "models/logCurveInfo";
import LogObject from "models/logObject";
import { measureToString } from "models/measure";
//import {  ContentType } from "./table";
import { ContentType } from "components/ContentViews/table";
import { Row } from "@tanstack/react-table";

export const calculateIsCurveActive = (
  logCurveInfo: LogCurveInfo,
  maxDepth: number,
  isDepthIndex: boolean,
  curveThreshold: CurveThreshold
): boolean => {
  if (isDepthIndex) {
    return (
      maxDepth - parseFloat(logCurveInfo.maxDepthIndex) <
      curveThreshold.depthInMeters
    );
  } else {
    const dateDifferenceInMilliseconds =
      new Date().valueOf() - new Date(logCurveInfo.maxDateTimeIndex).valueOf();
    return (
      dateDifferenceInMilliseconds <
      timeFromMinutesToMilliseconds(curveThreshold.timeInMinutes)
    );
  }
};

export const columns = (
  isDepthIndex: boolean,
  showOnlyPrioritizedCurves: boolean,
  prioritizedCurves: string[],
  logObjects: Map<string, object>,
  hideEmptyMnemonics: boolean
) => {
  return [
    ...(!isDepthIndex
      ? [{ property: "isActive", label: "active", type: ContentType.String }]
      : []),
    {
      property: "mnemonic",
      label: "mnemonic",
      type: ContentType.String,
      filterFn: (row: Row<any>) => {
        return (
          !showOnlyPrioritizedCurves ||
          prioritizedCurves.includes(row.original.mnemonic) ||
          row.original.mnemonic ===
            (logObjects.get(row.original.logUid) as LogObject).indexCurve // Always show index curve
        );
      }
    },
    {
      property: "minIndex",
      label: "minIndex",
      type: isDepthIndex ? ContentType.Number : ContentType.DateTime,
      filterFn: (row: Row<any>) => {
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
};

export const getTableData = (
  logCurveInfoList: LogCurveInfo[],
  logObjects: Map<string, object>,
  timeZone: TimeZone,
  dateTimeFormat: DateTimeFormat,
  curveThreshold: CurveThreshold,
  oneLogOnly: boolean = false
) => {
  const isDepthIndex = !!logCurveInfoList?.[0]?.maxDepthIndex;

  const isVisibleFunction = (isActive: boolean): (() => boolean) => {
    return () => {
      if (isDepthIndex) return true;
      return !(curveThreshold.hideInactiveCurves && !isActive);
    };
  };

  const maxDepth = Math.max(
    ...logCurveInfoList.map((x) => parseFloat(x.maxDepthIndex))
  );

  return logCurveInfoList
    .map((logCurveInfo) => {
      const logObje = logObjects.get(logCurveInfo.logUid) as LogObject;
      const isActive =
        logObje.objectGrowing &&
        calculateIsCurveActive(
          logCurveInfo,
          maxDepth,
          isDepthIndex,
          curveThreshold
        );
      return {
        id: `${logCurveInfo.logUid}-${logCurveInfo.mnemonic}`,
        uid: oneLogOnly
          ? `${logCurveInfo.logUid}`
          : `${logCurveInfo.logUid}-${logCurveInfo.mnemonic}`,
        logUid: logCurveInfo.logUid,
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
        wellUid: logObje.wellUid,
        wellboreUid: logObje.wellboreUid,
        wellName: logObje.wellName,
        wellboreName: logObje.wellboreName,
        traceState: logCurveInfo.traceState,
        nullValue: logCurveInfo.nullValue,
        isActive: isActive,
        isVisibleFunction: isVisibleFunction(isActive),
        logCurveInfo
      };
    })
    .sort((curve, curve2) => {
      if (
        curve.mnemonic.toLowerCase() ===
        (logObjects.get(curve.logUid) as LogObject).indexCurve?.toLowerCase()
      ) {
        return -1;
      } else if (
        curve2.mnemonic.toLowerCase() ===
        (logObjects.get(curve2.logUid) as LogObject).indexCurve?.toLowerCase()
      ) {
        return 1;
      }
      return curve.mnemonic.localeCompare(curve2.mnemonic);
    });
};
