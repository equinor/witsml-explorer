import * as echarts from 'echarts';
import {
  CustomSeriesRenderItem,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
} from 'echarts';

import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import LogObject from "../../models/logObject";
import { calculateLogTypeId, calculateLogTypeTimeId } from "../../models/wellbore";
import { ReactECharts, ReactEChartsProps } from '../Charts/pure';
import formatDateString from "../DateFormatter";
import { ContentTableRow } from "./table";

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
  start: string,
  end: string
}

export const LogsGraph = (): React.ReactElement => {
  const HEIGHT_RATIO = 0.6;
  const DIM_CATEGORY_INDEX = 0;
  const DIM_TIME_ARRIVAL = 1;
  const DIM_TIME_DEPARTURE = 2;

  const _cartesianXBounds = [];
  const _cartesianYBounds = [];


  const data: { name: string; value: number[]; itemStyle: { normal: { color: string; }; }; }[] = [];
  // const dataCount = 9;
  //const startTime = +new Date('2019-12-02T17:11:54.000+02:00');

  const categories = ['Generator_Data', 'Holesection_Marker_Log', 'Test_Calculation_MBE', 'bop_time', 'calc_activity', 'calc_gain_trip_tank_alert', 'model_log', 'rt_comments', 'wellprofile_time']
  const types = [
    { name: 'JS Heap', color: '#7b9ce1' },
    { name: 'Documents', color: '#bd6d6c' },
    { name: 'Nodes', color: '#75d874' },
    { name: 'Listeners', color: '#e0bc78' },
    { name: 'GPU Memory', color: '#dc77dc' },
    { name: 'GPU', color: '#72b362' }
  ];
  // Generate mock data
  // categories.forEach(function (category, index) {
  // var baseTime = startTime;

  const { navigationState } = useContext(NavigationContext);
  const { selectedWellbore, selectedLogTypeGroup } = navigationState;

  const {
    //  dispatchOperation,
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
        start: selectedWellbore && isTimeIndexed() ? formatDateString(log.startIndex, timeZone) : log.startIndex,
        end: selectedWellbore && isTimeIndexed() ? formatDateString(log.endIndex, timeZone) : log.endIndex,
      };
    });
  };

  const logy = getTableData();
  for (let i = 0; i < logy.length - 1; i++) {
    const typeItem = types[Math.round(Math.random() * (types.length - 1))];
    const log = logy[i];
    const baseTime = +new Date(log["start"]);
    const endTime = +new Date(log["end"]);
    const duration = endTime - baseTime;
    // console.log(log["name"])
    // console.log("start " + log["start"] ) 
    // console.log("end " + log["end"] ) 
    data.push({
      name: log["name"],
      value: [i, baseTime, endTime, duration],
      itemStyle: {
        normal: {
          color: typeItem.color
        }
      }
    });
    //  baseTime += Math.round(Math.random() * 2000);

    //console.log(baseTime)
  }

  //});

  const renderGanttItem: CustomSeriesRenderItem = (
    params: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI
  ) => {
    const categoryIndex = api.value(DIM_CATEGORY_INDEX);
    const timeArrival = api.coord([api.value(DIM_TIME_ARRIVAL), categoryIndex]);
    const timeDeparture = api.coord([api.value(DIM_TIME_DEPARTURE), categoryIndex]);
    const coordSys = params.coordSys;

    const retypedSys = coordSys as MyCoordSys;
    _cartesianXBounds[0] = retypedSys.x;
    _cartesianXBounds[1] = retypedSys.width;
    _cartesianYBounds[0] = retypedSys.y;
    _cartesianYBounds[1] = retypedSys.height;
    const barLength = timeDeparture[0] - timeArrival[0];
    // Get the heigth corresponds to length 1 on y axis.
    const barHeight = (((api.size && api.size([0, 1])) || [0, 20]) as number[])[1] * HEIGHT_RATIO;
    const x = timeArrival[0];
    const y = timeArrival[1] - barHeight;
    const flightNumber = api.value(3) + '';
    const flightNumberWidth = echarts.format.getTextRect(flightNumber).width;
    const text =
      barLength > flightNumberWidth + 40 && x + barLength >= 180
        ? flightNumber
        : '';
    const rectNormal = clipRectByRect(params, {
      x: x,
      y: y,
      width: barLength,
      height: barHeight
    });
    const rectVIP = clipRectByRect(params, {
      x: x,
      y: y,
      width: barLength / 2,
      height: barHeight
    });
    const rectText = clipRectByRect(params, {
      x: x,
      y: y,
      width: barLength,
      height: barHeight
    });
    return {
      type: 'group',
      children: [
        {
          type: 'rect',
          ignore: !rectNormal,
          shape: rectNormal,
          style: api.style()
        },
        {
          type: 'rect',
          ignore: !rectVIP && !api.value(4),
          shape: rectVIP,
          style: api.style({ fill: '#ddb30b' })
        },
        {
          type: 'rect',
          ignore: !rectText,
          shape: rectText,
          style: api.style({
            fill: 'transparent',
            stroke: 'transparent',
            text: text,
            //  textFill: '#fff'
          })
        }
      ]
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

    title: {
      text: 'Profile',
      left: 'center'
    },
    dataZoom: [
      {
        type: 'slider',
        filterMode: 'weakFilter',
        showDataShadow: false,
        top: 400,
        labelFormatter: ''
      },
      {
        type: 'inside',
        filterMode: 'weakFilter'
      }
    ],
    grid: {
      height: 300,
      show: true,
    },
    xAxis: {
      type: 'time',

      //  min: startTime,
      //  max: stopTime,
      //scale: true,
      axisLabel: {
        formatter: function (val: any) {
          return new Date(val).toLocaleDateString('en-US');
        }
      }
    },
    yAxis: {
      data: categories,
      show: false,

    },
    series: [
      {
        type: 'custom',
        renderItem: renderGanttItem,
        itemStyle: {
          opacity: 0.8
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: data
      }
    ]


  };




  //const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedLogObjectRows: LogObjectRow[]) => {
  //  const contextProps: ObjectContextMenuProps = { checkedObjects: checkedLogObjectRows.map((row) => row.logObject), wellbore: selectedWellbore };
  //  const position = getContextMenuPosition(event);
  //   dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <LogObjectContextMenu {...contextProps} />, position } });
  // };



  //const columns: ContentTableColumn[] = [
  //  { property: "name", label: "name", type: ContentType.String },
  //   { property: "runNumber", label: "runNumber", type: ContentType.String },
  //    { property: "startIndex", label: "startIndex", type: selectedWellbore && isTimeIndexed() ? ContentType.DateTime : ContentType.Measure },
  //   { property: "endIndex", label: "endIndex", type: selectedWellbore && isTimeIndexed() ? ContentType.DateTime : ContentType.Measure },
  //   { property: "indexType", label: "indexType", type: ContentType.String },
  //   { property: "uid", label: "uid", type: ContentType.String },
  //   { property: "dTimCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
  //   { property: "dTimLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime },
  //    { property: "indexType", label: "kravagraphtype", type: ContentType.String },
  // ];

  // const onSelect = (log: LogObjectRow) => {
  //  dispatchNavigation({
  //    type: NavigationType.SelectObject,
  //    payload: { object: log.logObject, well: selectedWell, wellbore: selectedWellbore, objectType: ObjectType.Log }
  //  });
  // };

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

    <ReactECharts option={option} size='1000px' ></ReactECharts>
  ) : (
    <></>
  );
};

export default LogsGraph;
