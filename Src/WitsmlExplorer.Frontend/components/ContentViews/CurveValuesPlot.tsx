import ReactEcharts from "echarts-for-react";
import React, { useContext } from "react";
import OperationContext from "../../contexts/operationContext";
import { CurveSpecification } from "../../models/logData";
import { Colors } from "../../styles/Colors";
import { ContentType, ExportableContentTableColumn } from "./table/tableParts";

interface CurveValuesPlotProps {
  data: any[];
  columns: ExportableContentTableColumn<CurveSpecification>[];
  name: string;
}

export const CurveValuesPlot = React.memo((props: CurveValuesPlotProps): React.ReactElement => {
  const { data, columns, name } = props;
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  const chartOption = getChartOption(data, columns, name, colors);

  return (
    <ReactEcharts
      option={chartOption}
      style={{
        height: "75%",
        width: "90%",
        marginTop: "0.5rem"
      }}
    />
  );
});
CurveValuesPlot.displayName = "CurveValuesPlot";

const getChartOption = (data: any[], columns: ExportableContentTableColumn<CurveSpecification>[], name: string, colors: Colors) => {
  const indexCurve = columns[0].columnOf.mnemonic;
  const indexUnit = columns[0].columnOf.unit;
  const isTimeLog = columns[0].type == ContentType.DateTime;
  const dataColumns = columns.filter((col) => col.property != indexCurve);
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
      left: "1%",
      top: "30px",
      data: dataColumns.map((col) => col.label),
      inactiveColor: colors.text.staticInactiveIndicator,
      textStyle: {
        color: colors.text.staticIconsDefault
      }
    },
    grid: {
      left: "2%",
      right: "6%",
      bottom: "3%",
      top: "15%",
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
      min: "dataMin",
      axisLabel: {
        color: colors.text.staticIconsDefault
      }
    },
    yAxis: {
      type: "category",
      inverse: true,
      axisLine: { onZero: true },
      axisLabel: {
        formatter: isTimeLog ? "{value}" : `{value} ${indexUnit}`,
        color: colors.text.staticIconsDefault
      },
      data: data.map((row) => row[indexCurve])
    },
    dataZoom: [
      {
        orient: "vertical",
        filterMode: "none",
        type: "inside"
      },
      {
        orient: "vertical",
        filterMode: "none",
        type: "slider"
      }
    ],
    series: dataColumns.map((col) => ({
      large: true,
      sampling: "lttb",
      symbol: "none",
      name: col.label,
      type: "line",
      connectNulls: false,
      lineStyle: {
        width: 2
      },
      data: data.map((row) => row[col.columnOf.mnemonic])
    }))
  };
};
