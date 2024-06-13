import * as echarts from "echarts";
import {
  CustomSeriesRenderItem,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams
} from "echarts";
import { useOperationState } from "hooks/useOperationState";

import {
  ReactEChartsProps,
  ReactLogChart
} from "components/ContentViews/Charts/ReactLogChart";
import { ContentTableRow } from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import { DateTimeFormat } from "contexts/operationStateReducer";
import LogObject from "models/logObject";
import React from "react";
import { useParams } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";

export interface LogObjectRow extends ContentTableRow, LogObject {
  logObject: LogObject;
}

export interface DataItem {
  key: number;
  name: string;
  value: number[];
  uid: string;
  itemStyle: { color: string };
  tooltip: { formatter: string };
}

interface LogItem {
  name: string;
  start: number;
  end: number;
  uid: string;
  startRaw: string;
  endRaw: string;
  runNumber: string;
  mnemonics: string;
}

const depthNullValue = -999.25;
const timeNullValue = +new Date("1900-01-01T00:00:00.000Z");

interface LogsGraphProps {
  logs: LogObject[];
}

export const LogsGraph = (props: LogsGraphProps): React.ReactElement => {
  const dimItemIndex = 0;
  const dimStart = 1;
  const dimEnd = 2;
  const data: DataItem[] = [];
  const categories: number[] = [];
  const {
    operationState: { colors }
  } = useOperationState();
  const { logs } = props;
  const {
    operationState: { timeZone, dateTimeFormat }
  } = useOperationState();
  const { logType } = useParams();

  const isTimeIndexed = logType === RouterLogType.TIME;

  const getGraphData = (): LogItem[] => {
    return logs.map((log) => {
      const start = isTimeIndexed
        ? +new Date(
            formatDateString(log.startIndex, timeZone, DateTimeFormat.Raw)
          )
        : log.startIndex === null
        ? 0
        : +log.startIndex?.replace("m", "");
      const end = isTimeIndexed
        ? +new Date(
            formatDateString(log.endIndex, timeZone, DateTimeFormat.Raw)
          )
        : log.endIndex === null
        ? 0
        : +log.endIndex?.replace("m", "");
      return {
        name: log.name + (log.runNumber != null ? ` (${log.runNumber})` : ""),
        start: start < end ? start : end,
        end: start < end ? end : start,
        uid: log.uid,
        startRaw: log.startIndex,
        endRaw: log.endIndex,
        runNumber: log.runNumber != null ? log.runNumber : "",
        mnemonics: log.mnemonics
      };
    });
  };

  const sortedLogs = getGraphData().sort((a, b) => {
    return a.start - b.start;
  });

  // set the position of empty logs to the start of the first log with data
  const nullValue = isTimeIndexed ? timeNullValue : depthNullValue;
  let lowestNonNullStart = nullValue;
  for (let i = 0; i < sortedLogs.length; i++) {
    if (sortedLogs[i].start != nullValue) {
      lowestNonNullStart = sortedLogs[i].start;
      break;
    }
  }
  for (let i = 0; i < sortedLogs.length; i++) {
    if (sortedLogs[i].start == nullValue && sortedLogs[i].end == nullValue) {
      sortedLogs[i].start = lowestNonNullStart;
      sortedLogs[i].end = lowestNonNullStart;
      sortedLogs[i].name += " (no data)";
    }
  }

  // calculates equal vertical distribution
  const barHeight = 30;
  const spacing = 30;
  const verticalAxisZoomMaxValue = () => {
    return (
      (gridMaxHeight() / (categories.length * (barHeight + spacing))) * 100
    );
  };

  const gridMaxHeight = () => {
    const numberOfCategories = categories.length;
    if (numberOfCategories < 13) {
      return numberOfCategories * (barHeight + spacing);
    }
    return 600;
  };

  const itemColor = (name: string): string => {
    let result = "";
    reservedColours.forEach(function (value, key) {
      if (name.toLowerCase().includes(value)) {
        result = key;
      }
    });
    // returns reserved colours
    if (result !== "") {
      return result;
    }
    return "#9AA";
  };

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];
    const start = log.start;
    const end = log.end;
    const startRaw = isTimeIndexed
      ? formatDateString(log.startRaw, timeZone, dateTimeFormat)
      : log.startRaw;
    const endRaw = isTimeIndexed
      ? formatDateString(log.endRaw, timeZone, dateTimeFormat)
      : log.endRaw;
    categories.push(i);
    data.push({
      key: i,
      name: log.name,
      uid: log.uid,
      value: [i, start, end],
      itemStyle: {
        color: itemColor(log.name)
      },
      tooltip: {
        formatter: `{b}<br />startIndex: ${startRaw}<br />endIndex: ${endRaw}<br />runNumber: ${log.runNumber}<br />mnemonics: ${log.mnemonics}`
      }
    });
  }

  const renderGanttItem: CustomSeriesRenderItem = (
    params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI
  ) => {
    const itemIndex = api.value(dimItemIndex);
    const start = api.coord([api.value(dimStart), itemIndex]);
    const end = api.coord([api.value(dimEnd), itemIndex]);
    let barLength = end[0] - start[0];
    let x = start[0];
    const y = end[1];
    //assures minimum bar lenght to be visible in graph
    const originalX = sortedLogs[itemIndex as number].start;
    if (barLength < 1) {
      barLength = 3;
      // should not be located outside graph
      if (originalX - barLength > 0) {
        x = x - barLength;
      }
    }
    const itemText = data[itemIndex as number].name;
    let position: "insideLeft" | "left" | "right" = "insideLeft";
    let itemRect = clipRectByRect(params, {
      x: x,
      y: y,
      width: barLength,
      height: barHeight
    });

    // ensure labels are shown when items are outside the view
    if (!itemRect) {
      const coordSys = params.coordSys as any;
      if (start[0] > coordSys.x + coordSys.width) {
        itemRect = {
          x: coordSys.x + coordSys.width - 1,
          y,
          width: 0,
          height: barHeight
        };
        position = "left";
      } else if (end[0] < coordSys.x) {
        itemRect = {
          x: coordSys.x,
          y,
          width: 0,
          height: barHeight
        };
        position = "right";
      }
    }

    return {
      type: "group",
      // children due to have a possibility to have more different rectangles
      children: [
        {
          type: "rect",
          ignore: !itemRect,
          shape: itemRect,
          style: {
            fill: api.visual("color"),
            opacity: 0.8
          },
          textConfig: {
            position
          },
          textContent: {
            type: "text",
            style: {
              text: itemText,
              fontSize: 13,
              textFill: colors.text.staticIconsDefault
            }
          }
        }
      ]
    };
  };

  function clipRectByRect(params: any, rect: any) {
    return echarts.graphic.clipRectByRect(rect, {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    });
  }

  const option: ReactEChartsProps["option"] = {
    tooltip: {},
    dataZoom: [
      {
        type: "slider",
        filterMode: "none",
        showDataShadow: false,
        top: 15,
        labelFormatter: ""
      },
      {
        type: "inside",
        filterMode: "weakFilter"
      },
      {
        type: "slider",
        yAxisIndex: 0,
        zoomLock: true,
        width: 0,
        right: "8%",
        top: 60,
        bottom: 640 - gridMaxHeight(),
        start: 0,
        end: verticalAxisZoomMaxValue(),
        handleSize: 0,
        showDetail: false
      }
    ],
    grid: {
      height: gridMaxHeight(),
      show: true
    },
    xAxis: {
      type: isTimeIndexed ? "time" : "value",
      position: "bottom",
      splitLine: {
        show: true,
        lineStyle: {
          color: ["#D3D3D3"]
        }
      }
    },
    yAxis: {
      data: categories,
      show: false,
      inverse: true,
      min: 0,
      max: categories.length
    },
    series: [
      {
        type: "custom",
        renderItem: renderGanttItem,
        itemStyle: {
          opacity: 0.8
        },
        label: {
          show: true
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: data,
        clip: true
      }
    ]
  };

  return logs?.length > 0 ? (
    <ReactLogChart option={option} width="100%" height="700px"></ReactLogChart>
  ) : (
    <></>
  );
};

// dedicated colors for items containing specific names
const reservedColours: Map<string, string> = new Map([
  ["#0088DD", "surface"],
  ["#DD2222", "downhole"],
  ["#DDBB00", "memory"]
]);

export default LogsGraph;
