import formatDateString from "components/DateFormatter";
import {
  timeFromMinutesToMilliseconds,
  CurveThreshold
} from "contexts/curveThresholdContext";
import { DateTimeFormat, TimeZone } from "contexts/operationStateReducer";
import LogCurveInfo, { isNullOrEmptyIndex } from "models/logCurveInfo";
import LogObject from "models/logObject";
import { measureToString } from "models/measure";
import { ContentType } from "components/ContentViews/table";
import { Row } from "@tanstack/react-table";
import MultiLogCurveInfo from "models/multilogCurveInfo";

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
  logObjects: Map<string, LogObject>,
  hideEmptyMnemonics: boolean,
  oneLogOnly: boolean = false
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
    ...(!oneLogOnly
      ? [{ property: "logName", label: "logName", type: ContentType.String }]
      : []),
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
  logCurveInfoList: MultiLogCurveInfo[],
  logObjects: Map<string, LogObject>,
  timeZone: TimeZone,
  dateTimeFormat: DateTimeFormat,
  curveThreshold: CurveThreshold,
  logUid: string = null
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
      if (logUid !== null) {
        logCurveInfo.logUid = logUid;
      }
      const logObject = logObjects.get(logCurveInfo.logUid);
      const isActive =
        logObject.objectGrowing &&
        calculateIsCurveActive(
          logCurveInfo,
          maxDepth,
          isDepthIndex,
          curveThreshold
        );
      return {
        id: `${logCurveInfo.logUid}-${logCurveInfo.mnemonic}`,
        uid:
          logUid === null
            ? `${logCurveInfo.uid}`
            : `${logCurveInfo.logUid}-${logCurveInfo.mnemonic}`,
        logName: logObject.name,
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
        wellUid: logObject.wellUid,
        wellboreUid: logObject.wellboreUid,
        wellName: logObject.wellName,
        wellboreName: logObject.wellboreName,
        traceState: logCurveInfo.traceState,
        nullValue: logCurveInfo.nullValue,
        isActive: isActive,
        isVisibleFunction: isVisibleFunction(isActive),
        logCurveInfo
      };
    })
    .sort((curve, curve2) => {
      if (logUid !== null) {
        if (
          curve.mnemonic.toLowerCase() ===
          logObjects.get(curve.logName).indexCurve?.toLowerCase()
        ) {
          return -1;
        } else if (
          curve2.mnemonic.toLowerCase() ===
          logObjects.get(curve2.logName).indexCurve?.toLowerCase()
        ) {
          return 1;
        }
        return curve.mnemonic.localeCompare(curve2.mnemonic);
      }
      if (curve.logName !== curve2.logName) {
        return curve.logName.localeCompare(curve2.logName);
      } else {
        return curve.mnemonic.localeCompare(curve2.mnemonic);
      }
    });
};
