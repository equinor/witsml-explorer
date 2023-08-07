
import type { ECharts, EChartsOption, SetOptionOpts } from "echarts";
import { getInstanceByDom, init } from "echarts";
import type { CSSProperties } from "react";
import { useContext, useEffect, useRef } from "react";
import NavigationContext from "../../../contexts/navigationContext";
import NavigationType from "../../../contexts/navigationType";
import { ObjectType } from "../../../models/objectType";
import { LogObjectRow } from "./LogsGraph";

export interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
  size: string
}

export function ReactLogChart({
  option,
  style,
  settings,
  loading,
  theme,
  size
}: ReactEChartsProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }

    chart?.on('click', () => {
      const myLog = selectedWellbore.logs[2];
      const myLogObject: LogObjectRow = { name: '', id: 1, uid: '1', wellboreName: '', wellboreUid: '', wellName: '', wellUid: '2', logObject: myLog };
      onSelect(myLogObject);
    })

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


  const onSelect = (log: LogObjectRow) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: { object: log.logObject, well: selectedWell, wellbore: selectedWellbore, objectType: ObjectType.Log }
    });
  };



  return <div ref={chartRef} style={{ width: size, height: "647px", ...style }} />;
}



