import { ECharts } from "echarts";
import ReactEcharts from "echarts-for-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import OperationContext from "../../contexts/operationContext";
import { DateTimeFormat, TimeZone } from "../../contexts/operationStateReducer";
import { CurveSpecification } from "../../models/logData";
import { Colors } from "../../styles/Colors";
import formatDateString from "../DateFormatter";
import { ContentViewDimensionsContext } from "../PageLayout";
import { ContentType, ExportableContentTableColumn } from "./table/tableParts";

const COLUMN_WIDTH = 125;
const EXTRA_WIDTH = 200;

interface CurveValuesPlotProps {
  data: any[];
  columns: ExportableContentTableColumn<CurveSpecification>[];
  name: string;
  autoRefresh: boolean;
  isDescending?: boolean;
}

export const CurveValuesPlot = React.memo((props: CurveValuesPlotProps): React.ReactElement => {
  const { data, columns, name, autoRefresh, isDescending = false } = props;
  const {
    operationState: { colors, dateTimeFormat }
  } = useContext(OperationContext);
  const chart = useRef<ECharts>(null);
  const selectedLabels = useRef<Record<string, boolean>>(null);
  const scrollIndex = useRef<number>(0);
  const horizontalZoom = useRef<[number, number]>([0, 100]);
  const [maxColumns, setMaxColumns] = useState<number>(15);
  const { width: contentViewWidth } = useContext(ContentViewDimensionsContext);

  useEffect(() => {
    if (contentViewWidth) {
      const newMaxColumns = Math.floor((contentViewWidth - EXTRA_WIDTH) / COLUMN_WIDTH);
      if (newMaxColumns !== maxColumns) {
        setMaxColumns(newMaxColumns);
      }
    }
  }, [contentViewWidth]);

  const chartOption = getChartOption(
    data,
    columns,
    name,
    colors,
    dateTimeFormat,
    isDescending,
    autoRefresh,
    maxColumns,
    selectedLabels.current,
    scrollIndex.current,
    horizontalZoom.current
  );

  const onMouseMove = () => {
    const TOOLTIP_LEFT_POSITION = 60;
    const axisTooltipDOM = document.createElement("div");
    const axisTooltipContent = document.createElement("div");
    axisTooltipDOM.appendChild(axisTooltipContent);
    axisTooltipDOM.style.cssText =
      "position: absolute; visibility: hidden; max-width: 50%; background-color: #fff; color: #333; padding: 5px 15px; border-radius: 2px; box-shadow: 0 0 2px #aaa; transition: transform ease .3s, visibility ease .3s; transform: scale(0); transform-origin: bottom;";
    const axisTooltipStyle = axisTooltipDOM.style;
    chart.current.getDom().appendChild(axisTooltipDOM);
    chart.current
      .on("mouseover", (e) => {
        if (e.targetType !== "axisLabel") {
          return;
        }
        if (e.componentType !== "xAxis") {
          return;
        }
        const indexCurve = columns[0].columnOf.mnemonic;
        const dataColumns = columns.filter((col) => col.property != indexCurve);
        const currLabel = e.event.target as any;
        const fullText = dataColumns[Math.floor(e.value as number)];
        const displayText = fullText.label;
        (axisTooltipContent as any).innerText = displayText;
        axisTooltipStyle.left = TOOLTIP_LEFT_POSITION + currLabel.transform[4] + "px";
        axisTooltipStyle.top = currLabel.transform[5] + "px";
        axisTooltipStyle.transform = "";
        axisTooltipStyle.visibility = "visible";
      })
      .on("mouseout", () => {
        axisTooltipStyle.visibility = "hidden";
        axisTooltipStyle.transform = "scale(0)";
      });
  };

  const onLegendChange = (params: { name: string; selected: Record<string, boolean> }) => {
    const shouldShowAll = Object.values(params.selected).every((s) => s === false);
    const actionType = shouldShowAll ? "legendSelect" : "legendUnSelect";
    chart.current.dispatchAction({ type: "legendSelect", name: params.name });
    for (const legend in params.selected) {
      if (legend !== params.name) {
        chart.current.dispatchAction({
          type: actionType,
          name: legend
        });
      }
    }
    selectedLabels.current = {
      ...Object.keys(params.selected).reduce((acc, key) => {
        acc[key] = shouldShowAll;
        return acc;
      }, {} as Record<string, boolean>),
      [params.name]: true
    };
  };

  const onLegendScroll = (params: { scrollDataIndex: number }) => {
    scrollIndex.current = params.scrollDataIndex;
  };

  const onDataZoom = (params: { dataZoomId: string; start: number; end: number }) => {
    if (params.dataZoomId == "horizontalZoom") {
      horizontalZoom.current = [params.start, params.end];
    }
  };

  const handleEvents = {
    legendselectchanged: onLegendChange,
    legendscroll: onLegendScroll,
    datazoom: onDataZoom,
    mousemove: onMouseMove
  };

  return (
    <ReactEcharts
      option={chartOption}
      onEvents={handleEvents}
      onChartReady={(c) => (chart.current = c)}
      style={{
        height: "100%",
        width: "95%",
        marginTop: "0.5rem",
        maxWidth: `${Math.min(maxColumns, columns.length / 1) * COLUMN_WIDTH + EXTRA_WIDTH}px`
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
  dateTimeFormat: DateTimeFormat,
  isDescending: boolean,
  autoRefresh: boolean,
  maxColumns: number,
  selectedLabels: Record<string, boolean>,
  scrollIndex: number,
  horizontalZoom: [number, number]
) => {
  const VALUE_OFFSET_FROM_COLUMN = 0.01;
  const AUTO_REFRESH_SIZE = 300;
  const LABEL_MAXIMUM_LENGHT = 13;
  if (autoRefresh) data = data.slice(-AUTO_REFRESH_SIZE); // Slice to avoid lag while streaming
  const indexCurve = columns[0].columnOf.mnemonic;
  const indexUnit = columns[0].columnOf.unit;
  const isTimeLog = columns[0].type == ContentType.DateTime;
  const dataColumns = columns.filter((col) => col.property != indexCurve);
  const isHorizonalScrolling = maxColumns >= columns.length ? true : false;
  const numberOfColumns = isHorizonalScrolling ? Math.min(maxColumns, columns.length / 1) - 1 : Math.min(maxColumns, columns.length / 1);
  const maxWidht = isHorizonalScrolling ? numberOfColumns * COLUMN_WIDTH + 65 : numberOfColumns * COLUMN_WIDTH - 120;
  const columnWidth = numberOfColumns === 0 ? maxWidht : maxWidht / numberOfColumns;
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
      text: name + (autoRefresh ? ` (last ${AUTO_REFRESH_SIZE} rows)` : ""),
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
      },
      selected: selectedLabels,
      scrollDataIndex: scrollIndex
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
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "none" },
      showContent: false
    },
    xAxis: {
      type: "value",
      position: "top",
      ellipsis: "...",
      overflow: "truncate",
      min: (value: { min: number; max: number }) => value.min - VALUE_OFFSET_FROM_COLUMN,
      max: (value: { min: number; max: number }) => (value.max - value.min < 1 ? value.min + 1 - VALUE_OFFSET_FROM_COLUMN : dataColumns.length),
      minInterval: 1,
      maxInterval: 1,
      splitLine: {
        lineStyle: {
          color: colors.text.staticIconsDefault
        }
      },
      triggerEvent: true,
      axisLabel: {
        show: true,
        padding: [0, -110, 0, 0],
        align: "left",
        color: colors.text.staticIconsDefault,
        hideOverlap: false,
        showMaxLabel: false,
        showMinLabel: autoRefresh || null,
        formatter: (param: number) => {
          const index = Math.floor(param);
          if (index >= dataColumns.length) return "";
          const curve = dataColumns[index].columnOf.mnemonic;
          const minMaxValue = minMaxValues.find((v) => v.curve == curve);
          const title = curve.length > LABEL_MAXIMUM_LENGHT ? curve.substring(0, LABEL_MAXIMUM_LENGHT) + "..." : curve;
          const result = "{title|" + title + "}\n" + "{hr|} \n" + " {minValue|" + +minMaxValue.minValue?.toFixed(3) + "}{maxValue|" + +minMaxValue.maxValue?.toFixed(3) + "}";
          return result;
        },
        rich: {
          title: {
            width: columnWidth,
            align: "center",
            padding: [0, 0, 0, 0],
            fontWeight: "bold"
          },
          hr: {
            width: "100%",
            height: 0
          },
          minValue: {
            width: 40,
            align: "left",
            fontWeight: "bold"
          },
          maxValue: {
            width: 40,
            align: "right",
            fontWeight: "bold"
          }
        }
      }
    },
    yAxis: {
      type: isTimeLog ? "time" : "value",
      inverse: !isDescending,
      min: (value: { min: number }) => value.min - 0.001, // The edge points can disappear, so make sure everything is shown
      max: (value: { max: number }) => value.max + 0.001,
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: true,
        formatter: (params: number) => (isTimeLog ? timeFormatter(params, dateTimeFormat) : depthFormatter(params, indexUnit)),
        color: colors.text.staticIconsDefault
      }
    },
    dataZoom: [
      autoRefresh
        ? null
        : {
            orient: "vertical",
            filterMode: "empty",
            type: "inside"
          },
      autoRefresh
        ? null
        : {
            orient: "vertical",
            filterMode: "empty",
            type: "slider",
            labelFormatter: () => ""
          },
      maxColumns >= dataColumns.length
        ? null
        : {
            id: "horizontalZoom",
            orient: "horizontal",
            filterMode: "empty",
            type: "slider",
            start: horizontalZoom[0],
            end: horizontalZoom[1],
            minValueSpan: Math.min(dataColumns.length, maxColumns),
            maxValueSpan: Math.min(dataColumns.length, maxColumns),
            labelFormatter: () => ""
          }
    ],
    animation: false,
    backgroundColor: colors.ui.backgroundDefault,
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
          const offsetNormalizedValue = normalizedValue * (1 - 2 * VALUE_OFFSET_FROM_COLUMN) + VALUE_OFFSET_FROM_COLUMN + i;
          return [offsetNormalizedValue, index];
        })
      };
    })
  };
};

const timeFormatter = (params: number, dateTimeFormat: DateTimeFormat) => {
  const dateTime = new Date(Math.round(params));
  return formatDateString(dateTime.toISOString().split(".")[0] + "Z", TimeZone.Utc, dateTimeFormat);
};

const depthFormatter = (params: number, indexUnit: string) => {
  return `${params.toFixed(2)} ${indexUnit}`;
};
