import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import Fluid from "../../models/fluid";
import FluidsReport from "../../models/fluidsReport";
import { measureToString } from "../../models/measure";
import ComponentService from "../../services/componentService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import FluidContextMenu, { FluidContextMenuProps } from "../ContextMenus/FluidContextMenu";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface FluidsRow extends ContentTableRow {
  uid: string;
  type: string;
  locationSample: string;
  dTim: string;
  md: string;
  tvd: string;
  fluid: Fluid;
}

export const FluidsView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedObject } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [fluids, setFluids] = useState<Fluid[]>([]);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const selectedFluidsReport = selectedObject as FluidsReport;

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedFluidsReport) {
      const abortController = new AbortController();

      const getFluids = async () => {
        setFluids(
          await ComponentService.getComponents(
            selectedFluidsReport.wellUid,
            selectedFluidsReport.wellboreUid,
            selectedFluidsReport.uid,
            ComponentType.Fluid,
            undefined,
            abortController.signal
          )
        );
        setIsFetchingData(false);
      };

      getFluids();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedFluidsReport]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedRows: FluidsRow[]) => {
    const contextMenuProps: FluidContextMenuProps = {
      checkedFluids: checkedRows.map((row) => row.fluid)
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <FluidContextMenu {...contextMenuProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "type", label: "type", type: ContentType.String },
    { property: "locationSample", label: "locationSample", type: ContentType.String },
    { property: "dTim", label: "dTim", type: ContentType.String },
    { property: "md", label: "md", type: ContentType.Measure },
    { property: "tvd", label: "tvd", type: ContentType.Measure }
  ];

  const fluidRows: FluidsRow[] = fluids.map((fluid, index) => {
    return {
      id: index,
      uid: fluid.uid,
      type: fluid.type,
      locationSample: fluid.locationSample,
      dTim: fluid.dTim,
      md: measureToString(fluid.md),
      tvd: measureToString(fluid.tvd),
      fluid: fluid
    };
  });

  const insetColumns: ContentTableColumn[] = [
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "tempRheom", label: "tempRheom", type: ContentType.Measure },
    { property: "presRheom", label: "presRheom", type: ContentType.Measure },
    { property: "vis3Rpm", label: "vis3Rpm", type: ContentType.String },
    { property: "vis6Rpm", label: "vis6Rpm", type: ContentType.String },
    { property: "vis100Rpm", label: "vis100Rpm", type: ContentType.String },
    { property: "vis200Rpm", label: "vis200Rpm", type: ContentType.String },
    { property: "vis300Rpm", label: "vis300Rpm", type: ContentType.String },
    { property: "vis600Rpm", label: "vis600Rpm", type: ContentType.String }
  ];

  const fluidInsetRows = Object.fromEntries(
    fluids.map((fluid) => [
      fluid.uid,
      fluid.rheometers.map((rheometer) => {
        return {
          uid: rheometer.uid,
          tempRheom: measureToString(rheometer.tempRheom),
          presRheom: measureToString(rheometer.presRheom),
          vis3Rpm: rheometer.vis3Rpm,
          vis6Rpm: rheometer.vis6Rpm,
          vis100Rpm: rheometer.vis100Rpm,
          vis200Rpm: rheometer.vis200Rpm,
          vis300Rpm: rheometer.vis300Rpm,
          vis600Rpm: rheometer.vis600Rpm
        };
      })
    ])
  );

  return selectedFluidsReport && !isFetchingData ? (
    <ContentTable columns={columns} data={fluidRows} onContextMenu={onContextMenu} checkableRows inset={{ columns: insetColumns, data: fluidInsetRows }} />
  ) : (
    <></>
  );
};

export default FluidsView;
