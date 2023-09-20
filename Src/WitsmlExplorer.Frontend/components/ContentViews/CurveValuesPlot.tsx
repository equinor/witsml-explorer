import { ECharts } from "echarts";
import ReactEcharts from "echarts-for-react";
import React, { useContext, useRef } from "react";
import OperationContext from "../../contexts/operationContext";
import { CurveSpecification } from "../../models/logData";
import { Colors } from "../../styles/Colors";
import { ContentType, ExportableContentTableColumn } from "./table/tableParts";
import formatDateString from "../DateFormatter";
import { TimeZone, DateTimeFormat } from "../../contexts/operationStateReducer";

interface CurveValuesPlotProps {
  data: any[];
  columns: ExportableContentTableColumn<CurveSpecification>[];
  name: string;
}

export const CurveValuesPlot = React.memo((props: CurveValuesPlotProps): React.ReactElement => {
  const { data, columns, name } = props;
  const {
    operationState: { colors, timeZone, dateTimeFormat }
  } = useContext(OperationContext);
  const chart = useRef<ECharts>(null);

  const chartOption = React.useMemo(() => getChartOption(data, columns, name, colors, timeZone, dateTimeFormat), [data, columns, name, colors, timeZone, dateTimeFormat]);

  const onLegendChange = (params: { name: string; selected: Record<string, boolean> }) => {
    const actionType = Object.values(params.selected).every((s) => s === false) ? "legendSelect" : "legendUnSelect";
    chart.current.dispatchAction({ type: "legendSelect", name: params.name });
    for (const legend in params.selected) {
      if (legend !== params.name) {
        chart.current.dispatchAction({
          type: actionType,
          name: legend
        });
      }
    }
  };

  const handleEvents = {
    legendselectchanged: onLegendChange
  };

  return (
    <ReactEcharts
      option={chartOption}
      onEvents={handleEvents}
      onChartReady={(c) => (chart.current = c)}
      style={{
        height: "100%",
        width: "95%",
        marginTop: "0.5rem"
      }}
    />
  );
});
CurveValuesPlot.displayName = "CurveValuesPlot";

const getChartOption = (
  data: any[],
  columns: ExportableContentTableColumn<CurveSpecification>[],
  name: string,
  colors: Colors,
  timeZone: TimeZone,
  dateTimeFormat: DateTimeFormat
) => {
  const valueOffsetFromColumn = 0.01;
  const indexCurve = columns[0].columnOf.mnemonic;
  const indexUnit = columns[0].columnOf.unit;
  const isTimeLog = columns[0].type == ContentType.DateTime;
  const dataColumns = columns.filter((col) => col.property != indexCurve);
  const minMaxValues = columns
    .map((col) => col.columnOf.mnemonic)
    .map((curve) => {
      const curveData = data.map((obj) => obj[curve]).filter(Number.isFinite);
      return {
        curve: curve,
        minValue: curveData.length == 0 ? null : curveData.reduce((min, v) => (min <= v ? min : v), Infinity),
        maxValue: curveData.length == 0 ? null : curveData.reduce((max, v) => (max >= v ? max : v), -Infinity)
      };
    });

  return {
    title: {
      left: "center",
      text: name,
      textStyle: {
        color: colors.text.staticIconsDefault
      }
    },
    legend: {
      type: "scroll",
      left: "30px",
      top: "30px",
      data: dataColumns.map((col) => col.label),
      inactiveColor: colors.text.staticInactiveIndicator,
      selectedMode: "onlyHover",
      textStyle: {
        color: colors.text.staticIconsDefault
      }
    },
    grid: {
      left: "30px",
      right: "50px",
      bottom: "50px",
      top: "80px",
      containLabel: true
    },
    toolbox: {
      feature: {
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "value",
      min: (value: { min: number; max: number }) => value.min - valueOffsetFromColumn,
      max: (value: { min: number; max: number }) => (value.max - value.min < 1 ? value.min + 1 - valueOffsetFromColumn : dataColumns.length),
      minInterval: 1,
      maxInterval: 1,
      splitLine: {
        lineStyle: {
          color: colors.text.staticIconsDefault
        }
      },
      axisLabel: {
        show: true,
        padding: [0, -110, 0, 0],
        align: "left",
        color: colors.text.staticIconsDefault,
        hideOverlap: false,
        showMaxLabel: false,
        formatter: (param: number) => {
          const index = Math.floor(param);
          if (index >= dataColumns.length) return "";
          const curve = dataColumns[index].columnOf.mnemonic;
          const minMaxValue = minMaxValues.find((v) => v.curve == curve);
          return `${curve}\n${+minMaxValue.minValue?.toFixed(3)} - ${+minMaxValue.maxValue?.toFixed(3)}`;
        }
      }
    },
    yAxis: {
      type: isTimeLog ? "time" : "value",
      inverse: true,
      min: (value: { min: number }) => value.min - 0.001, // The edge points can disappear, so make sure everything is shown
      max: (value: { max: number }) => value.max + 0.001,
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: true,
        formatter: isTimeLog ? (params: number) => timeFormatter(params, timeZone, dateTimeFormat) : (params: number) => depthFormatter(params, indexUnit),
        color: colors.text.staticIconsDefault
      }
    },
    dataZoom: [
      {
        orient: "vertical",
        filterMode: "empty",
        type: "inside"
      },
      {
        orient: "vertical",
        filterMode: "empty",
        type: "slider",
        labelFormatter: () => ""
      },
      {
        orient: "horizontal",
        filterMode: "empty",
        type: "slider",
        startValue: 0,
        endValue: 8,
        minValueSpan: 1,
        maxValueSpan: 12,
        labelFormatter: () => ""
      }
    ],
    animation: false,
    series: dataColumns.map((col, i) => {
      const minMaxValue = minMaxValues.find((v) => v.curve == col.columnOf.mnemonic);
      return {
        large: true,
        symbolSize: data.length > 200 ? 2 : 5,
        name: col.label,
        type: "scatter",
        data: data.map((row) => {
          const index = row[indexCurve];
          const value = row[col.columnOf.mnemonic];
          const normalizedValue = (value - minMaxValue.minValue) / (minMaxValue.maxValue - minMaxValue.minValue || 1);
          const offsetNormalizedValue = normalizedValue * (1 - 2 * valueOffsetFromColumn) + valueOffsetFromColumn + i;
          return [offsetNormalizedValue, index];
        })
      };
    })
  };
};

const timeFormatter = (params: number, timeZone: TimeZone, dateTimeFormat: DateTimeFormat) => {
  const dateTime = new Date(Math.round(params));
  return formatDateString(dateTime.toISOString().split(".")[0] + "Z", timeZone, dateTimeFormat);
};

const depthFormatter = (params: number, indexUnit: string) => {
  return `${params.toFixed(2)} ${indexUnit}`;
};
