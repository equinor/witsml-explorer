import type { ECharts, EChartsOption, SetOptionOpts } from "echarts";
import { getInstanceByDom, init } from "echarts";
import type { CSSProperties } from "react";
import { useContext, useEffect, useRef } from "react";
import NavigationContext from "../../../contexts/navigationContext";
import NavigationType from "../../../contexts/navigationType";
import LogObject from "../../../models/logObject";
import { ObjectType } from "../../../models/objectType";
import { DataItem, LogObjectRow } from "./LogsGraph";

export interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
  width: string;
  height: string;
}

export function ReactLogChart({ option, style, settings, loading, theme, width, height }: ReactEChartsProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }

    chart?.on("click", (params) => {
      const uid = (params.data as DataItem).uid;
      const id = (params.data as DataItem).key;
      const myLog = selectedWellbore.logs.filter((x) => x.uid === uid)[0];
      const myLogObject: LogObjectRow = {
        name: myLog.name,
        id: id,
        uid: myLog.uid,
        wellboreName: selectedWellbore.name,
        wellboreUid: selectedWellbore.uid,
        wellName: selectedWell.name,
        wellUid: selectedWell.uid,
        logObject: myLog
      };

      onSelect(myLogObject);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      loading === true ? chart?.showLoading() : chart?.hideLoading();
    }
  }, [loading, theme]);

  const { navigationState, dispatchNavigation } = useContext(NavigationContext);

  const { selectedWell, selectedWellbore } = navigationState;

  const onSelect = (log: LogObject) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: { object: log, well: selectedWell, wellbore: selectedWellbore, objectType: ObjectType.Log }
    });
  };

  return <div ref={chartRef} style={{ width: width, height: height, ...style }} />;
}
