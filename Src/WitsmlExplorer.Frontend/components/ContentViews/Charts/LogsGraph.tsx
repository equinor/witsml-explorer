import * as echarts from 'echarts';
import {
  CustomSeriesRenderItem,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
} from 'echarts';

import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../../contexts/navigationContext";
import OperationContext from "../../../contexts/operationContext";
import LogObject from "../../../models/logObject";
import { calculateLogTypeId, calculateLogTypeTimeId } from "../../../models/wellbore";
import formatDateString from "../../DateFormatter";
import { ContentTableRow } from "../table";
import { ReactEChartsProps, ReactLogChart } from './ReactLogChart';

export interface LogObjectRow extends ContentTableRow, LogObject {
  logObject: LogObject;
}

export interface DataItem {
  key: number,
  name: string,
  value: number[],
  uid: string,
  itemStyle: { normal: { color: string; } }
}

interface MyCoordSys {
  height: number;
  type: string;
  width: number;
  x: number;
  y: number;
}

interface LogItem {
  name: string,
  start: number,
  end: number,
  uid: string,
}

export const LogsGraph = (): React.ReactElement => {
  const dimItemIndex = 0;
  const dimStart = 1;
  const dimEnd = 2;
  const cartesianXBounds = [];
  const cartesianYBounds = [];
  const data: DataItem[] = [];
  const categories: number[] = [];
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore, selectedLogTypeGroup } = navigationState;

  // dedicated colors for items containing specific names
  const reservedColours: Map<string, string> = new Map([
    ['#0000FF', 'surface'],
    ['#FF0000', 'downhole'],
    ['#FFFF00', 'memory']
  ]);

  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const [logs, setLogs] = useState<LogObject[]>([]);
  const [resetCheckedItems, setResetCheckedItems] = useState(false);

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
        start: selectedWellbore && isTimeIndexed() ? +new Date(formatDateString(log.startIndex, timeZone)) : log.startIndex === null ? 0 : +log.startIndex?.replace('m', ''),
        end: selectedWellbore && isTimeIndexed() ? + new Date(formatDateString(log.endIndex, timeZone)) : log.endIndex === null ? 0 : +log.endIndex?.replace('m', ''),
        uid: log.uid,
        category: null
      };
    });
  };

  const sortedLogs = getTableData().sort((a, b) => {
    return a.start - b.start;
  });

  // calculates equal vertical distribution
  // needs to be more tuned
  const verticalAxisZoomMaxValue = () => {
    const numberOfCategories = categories.length;
    if (numberOfCategories < 13) {
      return 100
    }
    const a = 0.00358858;
    const b = 1.02584;
    const c = 70.3405;
    const result = a * Math.pow(numberOfCategories, 2) - (b * numberOfCategories) + c;
    return result;
  }

  const gridMaxHeight = () => {
    const numberOfCategories = categories.length;
    if (numberOfCategories < 13) {
      return numberOfCategories * 50;
    }
    return 600;
  }


  const randomColor = (name: string): string => {
    let result = '';
    reservedColours.forEach(function (value, key) {
      if (name.includes(value)) {
        result = key
      }
    });
    // returns reserved colours 
    if (result !== '') {
      return result;
    }
    return generateColor(name);
  };

  const generateColor = (name: string): string => {

    let result = '';
    for (let i = 0; i < 6; ++i) {
      const value = Math.floor(16 * Math.random());
      result += value.toString(16);
    }
    result = '#' + result;
    // recursion to avoid duplicities with reserved colours
    if (reservedColours.has(name)) {
      return generateColor(name);
    }
    return result;
  };

  for (let i = 0; i < sortedLogs.length; i++) {
    const log = sortedLogs[i];
    const start = log.start;
    const end = log.end;
    categories.push(
      i
    );
    data.push({
      key: i,
      name: log.name,
      uid: log.uid,
      value: [i, start, end],
      itemStyle: {
        normal: {
          color: randomColor(log.name)
        }
      },
    });

  }

  const renderGanttItem: CustomSeriesRenderItem = (
    params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI) => {
    const itemIndex = api.value(dimItemIndex);
    const start = api.coord([api.value(dimStart), itemIndex]);
    const end = api.coord([api.value(dimEnd), itemIndex]);
    const coordSys = params.coordSys;

    const retypedSys = coordSys as MyCoordSys;
    cartesianXBounds[0] = retypedSys.x;
    cartesianXBounds[1] = retypedSys.width;
    cartesianYBounds[0] = retypedSys.y;
    cartesianYBounds[1] = retypedSys.height;
    let barLength = end[0] - start[0];

    //assures minimum bar lenght to be visible in graph
    if (barLength < 40) {
      barLength = 40
    }
    const barHeight = 30;
    const x = start[0];
    const y = end[1];
    const itemText = data[itemIndex as number].name;
    const textWidth = echarts.format.getTextRect(itemText).width;
    const text =
      barLength > textWidth + 40 && x + barLength >= 180
        ? itemText
        : '';
    const rectText = clipRectByRect(params, {
      x: x,
      y: y,
      width: barLength,
      height: barHeight
    });

    return {
      type: 'group',
      // children due to have a possibility to have more different rectangles
      children: [
        {
          type: 'rect',
          ignore: !rectText,
          shape: rectText,
          style: {
            fill: api.visual('color')
          },
          textConfig: {
            position: 'insideLeft'
          },
          textContent: {
            type: 'text',
            style: {
              text: text,
              fontSize: 12,
              textFill: '#fff'
            },
          },
        }]
    };
  }

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
        type: 'slider',
        filterMode: 'weakFilter',
        showDataShadow: false,
        top: 15,
        labelFormatter: ''
      },
      {
        type: 'inside',
        filterMode: 'weakFilter'
      },
      {
        type: 'slider',
        yAxisIndex: 0,
        zoomLock: true,
        width: 0,
        right: '8%',
        top: 60,
        bottom: 640 - gridMaxHeight(),
        start: 0,
        end: verticalAxisZoomMaxValue(),
        handleSize: 0,
        showDetail: false
      },
    ],
    grid: {
      height: gridMaxHeight(),
      show: true,
    },
    xAxis: {
      type: isTimeIndexed() ? 'time' : 'value',
      position: 'bottom',
      splitLine: {
        show: true,
        lineStyle: {
          color: ['#D3D3D3']
        }
      },
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
        type: 'custom',
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

  useEffect(() => {
    if (resetCheckedItems) {
      setResetCheckedItems(false);
      getTableData();
    }
  }, [resetCheckedItems]);

  useEffect(() => {
    setResetCheckedItems(true);
  }, [selectedWellbore, selectedLogTypeGroup]);

  return selectedWellbore && !resetCheckedItems ? (
    <ReactLogChart option={option} width='100%' height='700px' ></ReactLogChart>
  ) : (
    <></>
  );
};

export default LogsGraph;


