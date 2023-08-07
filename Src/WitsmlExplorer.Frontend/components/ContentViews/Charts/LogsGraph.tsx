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

interface DataItem {
  key: number,
  name: string,
  value: number[],
  itemStyle: { normal: { color: string; } }
}

export const LogsGraph = (): React.ReactElement => {
  const DIM_ITEM_INDEX = 0;
  const DIM_START = 1;
  const DIM_END = 2;
  // const DIM_CATEGORY_INDEX = 3;
  const _cartesianXBounds = [];
  const _cartesianYBounds = [];
  const data: DataItem[] = [];
  const categories: number[] = [];
  const types = [
    { name: 'JS Heap', color: '#7b9ce1' },
    { name: 'Documents', color: '#bd6d6c' },
    { name: 'Nodes', color: '#75d874' },
    { name: 'Listeners', color: '#e0bc78' },
    { name: 'GPU Memory', color: '#dc77dc' },
    { name: 'GPU', color: '#72b362' }
  ];
  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore, selectedLogTypeGroup } = navigationState;

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
        start: selectedWellbore && isTimeIndexed() ? log.startIndex === null ? +new Date() : +new Date(formatDateString(log.startIndex, timeZone)) : +log.startIndex?.replace('m', ''),
        end: selectedWellbore && isTimeIndexed() ? log.endIndex === null ? +new Date() : + new Date(formatDateString(log.endIndex, timeZone)) : +log.endIndex?.replace('m', ''),
        uid: log.uid,
        category: null
      };
    });
  };

  const sortedLogs = getTableData().sort((a, b) => {
    return a.start - b.start;
  });

  for (let i = 0; i < sortedLogs.length; i++) {
    const typeItem = types[Math.round(Math.random() * (types.length - 1))];
    const log = sortedLogs[i];
    const start = log.start;
    const end = log.end;
    categories.push(
      i
    );
    data.push({
      key: i,
      name: log.name,
      value: [i, start, end],
      itemStyle: {
        normal: {
          color: typeItem.color
        }
      },
    });

  }

  const renderGanttItem: CustomSeriesRenderItem = (
    params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI
  ) => {
    const itemIndex = api.value(DIM_ITEM_INDEX);
    const start = api.coord([api.value(DIM_START), itemIndex]);
    const end = api.coord([api.value(DIM_END), itemIndex]);
    const coordSys = params.coordSys;

    const retypedSys = coordSys as MyCoordSys;
    _cartesianXBounds[0] = retypedSys.x;
    _cartesianXBounds[1] = retypedSys.width;
    _cartesianYBounds[0] = retypedSys.y;
    _cartesianYBounds[1] = retypedSys.height;
    let barLength = end[0] - start[0];
    if (barLength < 30) {
      barLength = 30
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
    title: {
      text: 'Profile',
      left: 'center'
    },
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
        top: 70,
        bottom: 20,
        start: 0,
        end: 60,
        handleSize: 0,
        showDetail: true
      },
    ],
    grid: {
      height: 500,
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
      show: true,
      inverse: true,
      min: 0,
      max: 15
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
          tooltip: [DIM_START, DIM_END]
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

    <ReactLogChart option={option} size='100%' ></ReactLogChart>
  ) : (
    <></>
  );
};

export default LogsGraph;


