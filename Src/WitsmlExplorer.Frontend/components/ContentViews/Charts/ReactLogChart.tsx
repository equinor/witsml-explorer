import { DataItem } from "components/ContentViews/Charts/LogsGraph";
import { useConnectedServer } from "contexts/connectedServerContext";
import type { ECharts, EChartsOption, SetOptionOpts } from "echarts";
import { getInstanceByDom, init } from "echarts";
import { ObjectType } from "models/objectType";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLogObjectViewPath } from "routes/utils/pathBuilder";

export interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
  width: string;
  height: string;
}

export function ReactLogChart({
  option,
  style,
  settings,
  loading,
  theme,
  width,
  height
}: ReactEChartsProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);
  const { wellUid, wellboreUid, logType } = useParams();

  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }

    chart?.on("click", (params) => {
      const uid = (params.data as DataItem).uid;
      navigate(
        getLogObjectViewPath(
          connectedServer?.url,
          wellUid,
          wellboreUid,
          ObjectType.Log,
          logType,
          uid
        )
      );
    });

    // Add chart resize listener
    // ResizeObserver is leading to a bit janky UX
    function resizeChart() {
      chart?.resize();
    }
    window.addEventListener("resize", resizeChart);

    // Return cleanup function
    return () => {
      chart?.dispose();
      window.removeEventListener("resize", resizeChart);
    };
  }, [theme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart?.setOption(option, settings);
    }
  }, [option, settings, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      loading === true ? chart?.showLoading() : chart?.hideLoading();
    }
  }, [loading, theme]);

  return (
    <div ref={chartRef} style={{ width: width, height: height, ...style }} />
  );
}
