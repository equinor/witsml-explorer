import { Row } from "@tanstack/react-table";
import { ContentTableRow, ContentType } from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import {
  CurveThreshold,
  timeFromMinutesToMilliseconds
} from "contexts/curveThresholdContext";
import { DateTimeFormat, TimeZone } from "contexts/operationStateReducer";
import LogCurveInfo from "models/logCurveInfo";
import LogObject from "models/logObject";
import { measureToString } from "models/measure";
import MultiLogCurveInfo from "models/multilogCurveInfo";
import { getNameOccurrenceSuffix } from "tools/logSameNamesHelper";
import BaseReport from "../../models/reports/BaseReport.tsx";

export interface LogCurveInfoRow extends ContentTableRow {
  uid: string;
  mnemonic: string;
  minIndex: number | Date;
  maxIndex: number | Date;
  classWitsml: string;
  unit: string;
  mnemAlias: string;
  curveDescription: string;
  logUid: string;
  wellUid: string;
  wellboreUid: string;
  wellName: string;
  wellboreName: string;
  isActive: boolean;
  logCurveInfo: LogCurveInfo;
}

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

export const getColumns = (
  isDepthIndex: boolean,
  showOnlyPrioritizedCurves: boolean,
  showMinimumDataQc: boolean,
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
          !hideEmptyMnemonics ||
          !isEmptyCurve(row.original.minIndex, row.original.maxIndex)
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
    {
      property: "curveDescription",
      label: "curveDescription",
      type: ContentType.String
    },
    { property: "mnemAlias", label: "mnemAlias", type: ContentType.String },
    { property: "traceState", label: "traceState", type: ContentType.String },
    { property: "nullValue", label: "nullValue", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String },
    ...(showMinimumDataQc
      ? [
          { property: "qcInfo", label: "qcInfo", type: ContentType.String },
          {
            property: "qcTimestamp",
            label: "qcTimestamp",
            type: ContentType.String
          }
        ]
      : [])
  ];
};

export const getTableData = (
  allLogs: LogObject[],
  logCurveInfoList: MultiLogCurveInfo[],
  logObjects: Map<string, LogObject>,
  minimumQcReport: BaseReport,
  timeZone: TimeZone,
  dateTimeFormat: DateTimeFormat,
  curveThreshold: CurveThreshold,
  isDepthIndex: boolean,
  logUid: string = null
) => {
  if (!logCurveInfoList) return [];

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

      let qcInfo = "";
      let qcTimestamp = "";
      if (minimumQcReport?.reportItems?.length > 0) {
        const reportItem = minimumQcReport.reportItems.find(
          (ri) => ri.mnemonic === logCurveInfo.mnemonic
        );

        if (reportItem) {
          qcInfo = (reportItem.qcIssues as string[]).join(", ");
          qcTimestamp = formatDateString(
            reportItem.timestamp,
            timeZone,
            dateTimeFormat
          );
        }
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
        logName: logObject.name + getNameOccurrenceSuffix(allLogs, logObject),
        logUid: logObject.uid,
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
        curveDescription: logCurveInfo.curveDescription,
        isActive: isActive,
        isVisibleFunction: isVisibleFunction(isActive),
        qcInfo,
        qcTimestamp,
        logCurveInfo
      };
    })
    .sort((curve, curve2) => {
      if (logUid !== null || curve.logName === curve2.logName) {
        if (
          curve.mnemonic.toLowerCase() ===
          logObjects.get(curve.logUid).indexCurve?.toLowerCase()
        ) {
          return -1;
        } else if (
          curve2.mnemonic.toLowerCase() ===
          logObjects.get(curve2.logUid).indexCurve?.toLowerCase()
        ) {
          return 1;
        }
        return curve.mnemonic.localeCompare(curve2.mnemonic);
      }
      return curve.logName.localeCompare(curve2.logName);
    });
};

const isEmptyCurve = (minIndex: string, maxIndex: string) => {
  return minIndex === maxIndex;
};
