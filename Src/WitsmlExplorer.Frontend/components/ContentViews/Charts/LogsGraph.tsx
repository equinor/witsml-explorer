import * as echarts from "echarts";
import { CustomSeriesRenderItem, CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams } from "echarts";

import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../../contexts/navigationContext";
import OperationContext from "../../../contexts/operationContext";
import LogObject from "../../../models/logObject";
import { calculateLogTypeId, calculateLogTypeTimeId } from "../../../models/wellbore";
import formatDateString from "../../DateFormatter";
import { ContentTableRow } from "../table";
import { ReactEChartsProps, ReactLogChart } from "./ReactLogChart";

export interface LogObjectRow extends ContentTableRow, LogObject {
  logObject: LogObject;
}

export interface DataItem {
  key: number;
  name: string;
  value: number[];
  uid: string;
  itemStyle: { normal: { color: string } };
}

interface LogItem {
  name: string;
  start: number;
  end: number;
  uid: string;
}

export const LogsGraph = (): React.ReactElement => {
  const dimItemIndex = 0;
  const dimStart = 1;
  const dimEnd = 2;
  const data: DataItem[] = [];
  const categories: number[] = [];
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore, selectedLogTypeGroup } = navigationState;

  // dedicated colors for items containing specific names
  const reservedColours: Map<string, string> = new Map([
    ["#0000FF", "surface"],
    ["#FF0000", "downhole"],
    ["#FFFF00", "memory"]
  ]);

  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [logs, setLogs] = useState<LogObject[]>([]);
  const [resetCheckedItems] = useState(false);

  useEffect(() => {
    if (selectedWellbore?.logs) {
      setLogs(selectedWellbore.logs.filter((log) => calculateLogTypeId(selectedWellbore, log.indexType) === selectedLogTypeGroup));
    }
  }, [selectedLogTypeGroup, selectedWellbore]);

  const isTimeIndexed = () => {
    return selectedLogTypeGroup === calculateLogTypeTimeId(selectedWellbore);
  };

  const getTableData = (): LogItem[] => {
    return logs.map((log) => {
      return {
        name: log.name,
        start: selectedWellbore && isTimeIndexed() ? +new Date(formatDateString(log.startIndex, timeZone)) : log.startIndex === null ? 0 : +log.startIndex?.replace("m", ""),
        end: selectedWellbore && isTimeIndexed() ? +new Date(formatDateString(log.endIndex, timeZone)) : log.endIndex === null ? 0 : +log.endIndex?.replace("m", ""),
        uid: log.uid,
        category: null
      };
    });
  };

  const sortedLogs = getTableData().sort((a, b) => {
    return a.start - b.start;
  });

  // calculates equal vertical distribution
  const barHeight = 30;
  const spacing = 30;
  const verticalAxisZoomMaxValue = () => {
    return (gridMaxHeight() / (categories.length * (barHeight + spacing))) * 100;
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
    return "#536878";
  };

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];
    const start = log.start;
    const end = log.end;
    categories.push(i);
    data.push({
      key: i,
      name: log.name,
      uid: log.uid,
      value: [i, start, end],
      itemStyle: {
        normal: {
          color: itemColor(log.name)
        }
      }
    });
  }

  const renderGanttItem: CustomSeriesRenderItem = (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI) => {
    const itemIndex = api.value(dimItemIndex);
    const start = api.coord([api.value(dimStart), itemIndex]);
    const end = api.coord([api.value(dimEnd), itemIndex]);
    let barLength = end[0] - start[0];
    let x = start[0];
    const y = end[1];
    //assures minimum bar lenght to be visible in graph
    const originalX = sortedLogs[itemIndex as number].start;
    if (barLength < 20) {
      barLength = 20;
      // should not be located outside graph
      if (originalX - barLength > 0) {
        x = x - barLength;
      }
    }
    const itemText = data[itemIndex as number].name;
    const textWidth = echarts.format.getTextRect(itemText).width;
    const text = barLength > textWidth + 40 && x + barLength >= 180 ? itemText : "";
    const rectText = clipRectByRect(params, {
      x: x,
      y: y,
      width: barLength,
      height: barHeight
    });

    return {
      type: "group",
      // children due to have a possibility to have more different rectangles
      children: [
        {
          type: "rect",
          ignore: !rectText,
          shape: rectText,
          style: {
            fill: api.visual("color")
          },
          textConfig: {
            position: "insideLeft"
          },
          textContent: {
            type: "text",
            style: {
              text: text,
              fontSize: 12,
              textFill: "#fff"
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
        filterMode: "weakFilter",
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
      type: isTimeIndexed() ? "time" : "value",
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
          y: 0,
          tooltip: [dimStart, dimEnd]
        },
        data: data
      }
    ]
  };

  return selectedWellbore && !resetCheckedItems ? <ReactLogChart option={option} width="100%" height="700px"></ReactLogChart> : <></>;
};

export default LogsGraph;
