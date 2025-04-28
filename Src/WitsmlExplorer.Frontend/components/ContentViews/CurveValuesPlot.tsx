import {
  Button,
  EdsProvider,
  Switch,
  Typography
} from "@equinor/eds-core-react";
import { Box } from "@mui/material";
import {
  ThresholdLevel,
  transformCurveData
} from "components/ContentViews/CurveDataTransformation";
import {
  ContentType,
  ExportableContentTableColumn
} from "components/ContentViews/table";
import formatDateString from "components/DateFormatter";
import { ContentViewDimensionsContext } from "components/PageLayout";
import { StyledNativeSelect } from "components/Select";
import { CommonPanelContainer } from "components/StyledComponents/Container";
import {
  DateTimeFormat,
  TimeZone,
  UserTheme
} from "contexts/operationStateReducer";
import { ECharts } from "echarts";
import ReactEcharts from "echarts-for-react";
import { useOperationState } from "hooks/useOperationState";
import { CurveSpecification } from "models/logData";
import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useParams } from "react-router-dom";
import { RouterLogType } from "routes/routerConstants";
import { Colors } from "styles/Colors";
import { normaliseThemeForEds } from "../../tools/themeHelpers.ts";
import { SettingCustomRanges } from "./SettingCustomRanges.tsx";

const COLUMN_WIDTH = 135;
const MNEMONIC_LABEL_WIDTH = COLUMN_WIDTH - 10;
const TOOLTIP_OFFSET_Y = 30;
const GAP_DISTANCE = 3;

interface ControlledTooltipProps {
  visible: boolean;
  position: { x: number; y: number };
  content: string;
}

interface CurveRange {
  minValue: number;
  maxValue: number;
}
export type CurveRanges = Record<string, CurveRange>;

interface CurveValuesPlotProps {
  data: any[];
  columns: ExportableContentTableColumn<CurveSpecification>[];
  name: string;
  autoRefresh: boolean;
  isDescending?: boolean;
}

export const CurveValuesPlot = React.memo(
  (props: CurveValuesPlotProps): React.ReactElement => {
    const {
      data,
      columns: rawColumns,
      name,
      autoRefresh,
      isDescending = false
    } = props;
    const columns = useMemo(
      () =>
        rawColumns.filter(
          (col, index) => col.type === ContentType.Number || index === 0
        ),
      [rawColumns]
    );
    const {
      operationState: { colors, dateTimeFormat, theme }
    } = useOperationState();
    const [enableScatter, setEnableScatter] = useState<boolean>(false);
    const [removeOutliers, setRemoveOutliers] = useState<boolean>(false);
    const [useCustomRanges, setUseCustomRanges] = useState<boolean>(false);
    const [outliersThresholdLevel, setOutliersThresholdLevel] =
      useState<ThresholdLevel>(ThresholdLevel.Medium);
    const chart = useRef<ECharts>(null);
    const selectedLabels = useRef<Record<string, boolean>>(null);
    const scrollIndex = useRef<number>(0);
    const horizontalZoom = useRef<[number, number]>([0, 100]);

    const verticalZoom = useRef<[number, number]>([0, 100]);
    const [maxColumns, setMaxColumns] = useState<number>(15);

    const { width: contentViewWidth } = useContext(
      ContentViewDimensionsContext
    );

    const [defineCustomRanges, setDefineCustomRanges] =
      useState<boolean>(false);
    const { logType } = useParams();
    const isTimeLog = logType === RouterLogType.TIME;
    const extraWidth = getExtraWidth(data, columns, dateTimeFormat, isTimeLog);
    const width =
      Math.min(maxColumns, columns.length - 1) * COLUMN_WIDTH + extraWidth;
    const [controlledTooltip, setControlledTooltip] =
      useState<ControlledTooltipProps>({
        visible: false
      } as ControlledTooltipProps);

    const [customRanges, setCustomRanges] = useState<CurveRanges>({});
    const rawDataRanges = useMemo(
      () => getDataRanges(columns, data),
      [columns, data]
    );
    const dataRanges = useCustomRanges
      ? { ...rawDataRanges, ...customRanges }
      : rawDataRanges;

    const transformedData = useMemo(
      () =>
        transformCurveData(
          data,
          columns,
          outliersThresholdLevel,
          !autoRefresh && removeOutliers,
          customRanges,
          useCustomRanges
        ),
      [
        data,
        columns,
        outliersThresholdLevel,
        removeOutliers,
        autoRefresh,
        customRanges,
        useCustomRanges
      ]
    );

    useEffect(() => {
      if (contentViewWidth) {
        const newMaxColumns = Math.floor(
          (contentViewWidth - extraWidth) / COLUMN_WIDTH
        );
        if (newMaxColumns !== maxColumns) {
          setMaxColumns(newMaxColumns);
        }
      }
    }, [contentViewWidth]);

    const chartOption = getChartOption(
      transformedData,
      columns,
      name,
      colors,
      dateTimeFormat,
      isDescending,
      autoRefresh,
      maxColumns,
      selectedLabels.current,
      scrollIndex.current,
      horizontalZoom.current,
      verticalZoom.current,
      isTimeLog,
      enableScatter,
      dataRanges
    );

    const onMouseOver = (e: any) => {
      if (
        e.targetType !== "axisLabel" ||
        e.componentType !== "xAxis" ||
        controlledTooltip?.visible
      )
        return;
      const mnemonic = columns[Math.floor(parseInt(e.value)) + 1];
      const curveData = data
        .map((obj) => obj[mnemonic.columnOf.mnemonic])
        .filter(Number.isFinite);
      const maxValue =
        curveData.length == 0
          ? null
          : curveData.reduce((max, v) => (max >= v ? max : v), -Infinity);
      const minValue =
        curveData.length == 0
          ? null
          : curveData.reduce((min, v) => (min <= v ? min : v), Infinity);
      setControlledTooltip({
        visible: true,
        position: { x: e.event.offsetX, y: e.event.offsetY + TOOLTIP_OFFSET_Y },
        content: `${mnemonic.label}\nMin: ${minValue}\nMax: ${maxValue}`
      });
    };

    const onMouseOut = (e: any) => {
      if (
        e.targetType !== "axisLabel" ||
        e.componentType !== "xAxis" ||
        !controlledTooltip?.visible
      )
        return;
      setControlledTooltip({ ...controlledTooltip, visible: false });
    };

    const onLegendChange = (params: {
      name: string;
      selected: Record<string, boolean>;
    }) => {
      const shouldShowAll = Object.values(params.selected).every(
        (s) => s === false
      );
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

    const openCustomRanges = () => {
      setDefineCustomRanges(true);
    };

    const onLegendScroll = (params: { scrollDataIndex: number }) => {
      scrollIndex.current = params.scrollDataIndex;
    };

    const onDataZoom = (params: {
      dataZoomId: string;
      start: number;
      end: number;
      batch: any;
    }) => {
      if (params.dataZoomId == "horizontalZoom") {
        horizontalZoom.current = [params.start, params.end];
      } else if (params.dataZoomId == "verticalZoom") {
        verticalZoom.current = [params.start, params.end];
      } else if (params.batch?.[0]?.dataZoomId == "verticalZoomInside") {
        verticalZoom.current = [params.batch[0].start, params.batch[0].end];
      }
    };

    const handleEvents = {
      legendselectchanged: onLegendChange,
      legendscroll: onLegendScroll,
      datazoom: onDataZoom,
      mouseover: onMouseOver,
      mouseout: onMouseOut
    };

    const onChange = (curveRanges: CurveRanges) => {
      setCustomRanges(curveRanges);
    };

    const onClose = () => {
      setDefineCustomRanges(false);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <CommonPanelContainer>
          <EdsProvider density={normaliseThemeForEds(theme)}>
            <Switch
              checked={enableScatter}
              onChange={() => setEnableScatter(!enableScatter)}
              size={theme === UserTheme.Compact ? "small" : "default"}
            />
            <Typography style={{ minWidth: "max-content" }}>
              Scatter Plot
            </Typography>
            {!autoRefresh && (
              <>
                <Switch
                  checked={removeOutliers}
                  onChange={() => setRemoveOutliers(!removeOutliers)}
                  size={theme === UserTheme.Compact ? "small" : "default"}
                />
                <Typography style={{ minWidth: "max-content" }}>
                  Hide Outliers
                </Typography>
                {removeOutliers && (
                  <>
                    <Typography
                      style={{ minWidth: "max-content", marginLeft: "12px" }}
                    >
                      Sensitivity:
                    </Typography>
                    <StyledNativeSelect
                      style={{ maxWidth: "100px" }}
                      label=""
                      id="threshold"
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        setOutliersThresholdLevel(
                          event.target.value as ThresholdLevel
                        )
                      }
                      value={outliersThresholdLevel}
                      colors={colors}
                    >
                      {Object.values(ThresholdLevel).map((value) => {
                        return (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        );
                      })}
                    </StyledNativeSelect>
                  </>
                )}
              </>
            )}
            <Switch
              checked={useCustomRanges}
              onChange={() => setUseCustomRanges(!useCustomRanges)}
              size={theme === UserTheme.Compact ? "small" : "default"}
            />
            <Typography
              style={{ minWidth: "max-content", marginRight: "12px" }}
            >
              Show Custom Ranges
            </Typography>
            {useCustomRanges && (
              <Button onClick={openCustomRanges}>Define Custom Ranges</Button>
            )}
            {defineCustomRanges ? (
              <Box
                sx={{
                  zIndex: 10,
                  position: "absolute",
                  width: "inherit",
                  top: "6.3rem",
                  minWidth: "174px",
                  pr: "0.1em"
                }}
              >
                <SettingCustomRanges
                  rawDataRanges={rawDataRanges}
                  customRanges={customRanges}
                  onChange={onChange}
                  onClose={onClose}
                />
              </Box>
            ) : null}
          </EdsProvider>
        </CommonPanelContainer>
        <div
          style={{ position: "relative", height: "100%", marginTop: "0.5rem" }}
        >
          <ReactEcharts
            option={chartOption}
            onEvents={handleEvents}
            onChartReady={(c) => (chart.current = c)}
            style={{
              height: "100%",
              minWidth: `${width}px`,
              maxWidth: `${width}px`
            }}
          />
          <div
            style={{
              // The style is added inline as using styled-components caused "flash of unstyled content"
              position: "absolute",
              maxWidth: "50%",
              backgroundColor: "#fff",
              color: "#333",
              padding: "5px 15px",
              borderRadius: "2px",
              boxShadow: "0 0 2px #aaa",
              transition: "opacity 0.1s ease-in-out",
              opacity: controlledTooltip.visible ? 1 : 0,
              transformOrigin: "bottom",
              top: controlledTooltip.position
                ? `${controlledTooltip.position.y}px`
                : "0px",
              left: controlledTooltip.position
                ? `${controlledTooltip.position.x}px`
                : "0px",
              border: "1px solid black",
              transform: "translate(-50%, 0)",
              whiteSpace: "pre"
            }}
          >
            {controlledTooltip.content}
          </div>
        </div>
      </div>
    );
  }
);
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
  horizontalZoom: [number, number],
  verticalZoom: [number, number],
  isTimeLog: boolean,
  enableScatter: boolean,
  dataRanges: CurveRanges
) => {
  const VALUE_OFFSET_FROM_COLUMN = 0.01;
  const AUTO_REFRESH_SIZE = 300;
  const LABEL_MAXIMUM_LENGHT = 13;
  const LABEL_NUMBER_MAX_LENGTH = 9;
  if (autoRefresh) data = data.slice(-AUTO_REFRESH_SIZE); // Slice to avoid lag while streaming
  const indexCurve = columns[0].columnOf.mnemonic;
  const indexUnit = columns[0].columnOf.unit;
  const dataColumns = columns.filter((col) => col.property != indexCurve);

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
      scrollDataIndex: scrollIndex,
      pageIconColor: colors.infographic.primaryMossGreen,
      pageTextStyle: {
        color: colors.infographic.primaryMossGreen
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
      iconStyle: {
        borderColor: colors.infographic.primaryMossGreen
      },
      feature: {
        restore: {},
        saveAsImage: {}
      }
    },
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "line",
        axis: "y"
      },
      formatter: (params: any[]) => {
        const indexLabel = isTimeLog
          ? timeFormatter(params[0].axisValue, dateTimeFormat)
          : depthFormatter(params[0].axisValue, indexUnit);
        return (
          `${indexLabel}<br/>` +
          params
            .map((p) => `${p.marker} ${p.seriesName}: ${p.value[2]}`)
            .join("<br/>")
        );
      }
    },
    xAxis: {
      type: "value",
      position: "top",
      min: (value: { min: number }) => Math.floor(value.min),
      max: (value: { max: number }) => Math.ceil(value.max),
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
          const range = dataRanges[curve];
          const title =
            curve.length > LABEL_MAXIMUM_LENGHT
              ? curve.substring(0, LABEL_MAXIMUM_LENGHT) + "..."
              : curve;
          let minValue = range.minValue?.toFixed(3) ?? "NaN";
          let maxValue = range.maxValue?.toFixed(3) ?? "NaN";
          if (minValue.length > LABEL_NUMBER_MAX_LENGTH) {
            minValue =
              minValue.substring(0, LABEL_NUMBER_MAX_LENGTH - 2) + "...";
          }
          if (maxValue?.length > LABEL_NUMBER_MAX_LENGTH) {
            maxValue =
              maxValue.substring(0, LABEL_NUMBER_MAX_LENGTH - 2) + "...";
          }
          const result = `{title|${title}}\n{hr|} \n {minValue|${minValue}}{maxValue|${maxValue}}`;
          return result;
        },
        rich: {
          title: {
            width: MNEMONIC_LABEL_WIDTH,
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
            fontWeight: "bold",
            fontSize: 11
          },
          maxValue: {
            width: 40,
            align: "right",
            fontWeight: "bold",
            fontSize: 11
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
        formatter: (params: number) =>
          isTimeLog
            ? timeFormatter(params, dateTimeFormat)
            : depthFormatter(params, indexUnit),
        color: colors.text.staticIconsDefault
      }
    },
    dataZoom: [
      autoRefresh
        ? null
        : {
            id: "verticalZoom",
            start: verticalZoom[0],
            end: verticalZoom[1],
            orient: "vertical",
            filterMode: enableScatter ? "empty" : "none",
            type: "slider",
            labelFormatter: () => ""
          },
      autoRefresh
        ? null
        : {
            id: "verticalZoomInside",
            orient: "vertical",
            filterMode: "empty",
            type: "inside"
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
      const range = dataRanges[col.columnOf.mnemonic];

      const offsetData = data
        .map((row, rowIndex) => {
          const index = row[indexCurve];
          const value = row[col.columnOf.mnemonic];
          const isSmallGap =
            !enableScatter &&
            value === undefined &&
            hasDataWithinRange(
              data,
              rowIndex,
              col.columnOf.mnemonic,
              GAP_DISTANCE
            );
          if (isSmallGap) {
            return null; // Return null and filter it away later to draw lines over small gaps.
          }
          const normalizedValue =
            (value - range.minValue) / (range.maxValue - range.minValue || 1);
          const offsetNormalizedValue =
            normalizedValue * (1 - 2 * VALUE_OFFSET_FROM_COLUMN) +
            VALUE_OFFSET_FROM_COLUMN +
            i;
          return [offsetNormalizedValue, index, value]; // The 3rd value is the original value. It's not shown in the graph, used in the tooltip.
        })
        .filter((r) => r !== null);

      return {
        large: true,
        connectNulls: false,
        symbolSize: enableScatter
          ? data.length > 200
            ? 2
            : 5
          : (value: any, params: any) => {
              const isIsolated =
                value !== undefined &&
                isNaN(offsetData[Math.max(0, params.dataIndex - 1)][0]) &&
                isNaN(
                  offsetData[
                    Math.min(offsetData.length - 1, params.dataIndex + 1)
                  ][0]
                );
              return isIsolated ? 1 : 0; // Only isolated data points should have a symbol for the line plot
            },
        emphasis: {
          disabled: true
        },
        name: col.label,
        type: enableScatter ? "scatter" : "line",
        showSymbol: true,
        data: offsetData
      };
    })
  };
};

const getDataRanges = (
  myColumns: ExportableContentTableColumn<CurveSpecification>[],
  data: any[]
): CurveRanges =>
  myColumns.slice(1).reduce<CurveRanges>((acc, col) => {
    const curve = col.columnOf.mnemonic;
    const curveData = data.map((obj) => obj[curve]).filter(Number.isFinite);

    acc[curve] = {
      minValue:
        curveData.length === 0
          ? null
          : curveData.reduce((min, v) => (min <= v ? min : v), Infinity),
      maxValue:
        curveData.length === 0
          ? null
          : curveData.reduce((max, v) => (max >= v ? max : v), -Infinity)
    };

    return acc;
  }, {});

const hasDataWithinRange = (
  data: any[],
  valueIndex: number,
  mnemonic: string,
  distanceFromIndex: number
): boolean => {
  const start = Math.max(0, valueIndex - distanceFromIndex);
  const end = Math.min(data.length, valueIndex + distanceFromIndex);
  const window = [
    ...data.slice(start, valueIndex),
    ...data.slice(valueIndex + 1, end + 1)
  ];
  if (window.some((d) => d[mnemonic] !== undefined)) {
    return true;
  }
  return false;
};

const timeFormatter = (params: number, dateTimeFormat: DateTimeFormat) => {
  const dateTime = new Date(Math.round(params));
  return formatDateString(
    dateTime.toISOString().split(".")[0] + "Z",
    TimeZone.Utc,
    dateTimeFormat
  );
};

const depthFormatter = (params: number, indexUnit: string) => {
  return `${params?.toFixed(2)} ${indexUnit}`;
};

const getExtraWidth = (
  data: any[],
  columns: ExportableContentTableColumn<CurveSpecification>[],
  dateTimeFormat: DateTimeFormat,
  isTimeLog: boolean
) => {
  // Estimate the width of the x-axis labels and the grid margin (everything in content view except for the data columns itself)
  const indexUnit = columns[0].columnOf.unit;
  const indexCurve = columns[0].columnOf.mnemonic;
  const maxIndex = data.slice(-1)[0][indexCurve];
  const dummy_time_index = 1649415600000;
  const formattedText = isTimeLog
    ? timeFormatter(dummy_time_index, dateTimeFormat)
    : depthFormatter(maxIndex, indexUnit);
  return formattedText.length * 6.3 + 82;
};
