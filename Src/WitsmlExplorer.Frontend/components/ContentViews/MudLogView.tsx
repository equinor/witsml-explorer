import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ComponentType } from "../../models/componentType";
import GeologyInterval from "../../models/geologyInterval";
import { measureToString } from "../../models/measure";
import MudLog from "../../models/mudLog";
import ComponentService from "../../services/componentService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import GeologyIntervalContextMenu, { GeologyIntervalContextMenuProps } from "../ContextMenus/GeologyIntervalContextMenu";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface GeologyIntervalRow extends ContentTableRow {
  typeLithology: string;
  description: string;
  mdTop: string;
  mdBottom: string;
  tvdTop: string;
  tvdBase: string;
  ropAv: string;
  wobAv: string;
  tqAv: string;
  currentAv: string;
  rpmAv: string;
  wtMudAv: string;
  ecdTdAv: string;
  dxcAv: string;
  uid: string;
  geologyInterval: GeologyInterval;
}

export const MudLogView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedObject } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [geologyIntervals, setGeologyIntervals] = useState<GeologyInterval[]>([]);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const selectedMudLog = selectedObject as MudLog;

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedMudLog) {
      const abortController = new AbortController();

      const getGeologyIntervals = async () => {
        setGeologyIntervals(
          await ComponentService.getComponents(
            selectedMudLog.wellUid,
            selectedMudLog.wellboreUid,
            selectedMudLog.uid,
            ComponentType.GeologyInterval,
            undefined,
            abortController.signal
          )
        );
        setIsFetchingData(false);
      };

      getGeologyIntervals();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedMudLog]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedRows: GeologyIntervalRow[]) => {
    const contextMenuProps: GeologyIntervalContextMenuProps = {
      checkedGeologyIntervals: checkedRows.map((row) => row.geologyInterval)
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <GeologyIntervalContextMenu {...contextMenuProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "typeLithology", label: "typeLithology", type: ContentType.String },
    { property: "description", label: "description", type: ContentType.String },
    { property: "mdTop", label: "mdTop", type: ContentType.Measure },
    { property: "mdBottom", label: "mdBottom", type: ContentType.Measure },
    { property: "tvdTop", label: "tvdTop", type: ContentType.Measure },
    { property: "tvdBase", label: "tvdBase", type: ContentType.Measure },
    { property: "ropAv", label: "ropAv", type: ContentType.Measure },
    { property: "wobAv", label: "wobAv", type: ContentType.Measure },
    { property: "tqAv", label: "tqAv", type: ContentType.Measure },
    { property: "currentAv", label: "currentAv", type: ContentType.Measure },
    { property: "rpmAv", label: "rpmAv", type: ContentType.Measure },
    { property: "wtMudAv", label: "wtMudAv", type: ContentType.Measure },
    { property: "ecdTdAv", label: "ecdTdAv", type: ContentType.Measure },
    { property: "dxcAv", label: "dxcAv", type: ContentType.Number },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const geologyIntervalRows: GeologyIntervalRow[] = geologyIntervals.map((geologyInterval) => {
    return {
      id: geologyInterval.uid,
      typeLithology: geologyInterval.typeLithology,
      description: geologyInterval.description,
      mdTop: measureToString(geologyInterval.mdTop),
      mdBottom: measureToString(geologyInterval.mdBottom),
      tvdTop: measureToString(geologyInterval.tvdTop),
      tvdBase: measureToString(geologyInterval.tvdBase),
      ropAv: measureToString(geologyInterval.ropAv),
      wobAv: measureToString(geologyInterval.wobAv),
      tqAv: measureToString(geologyInterval.tqAv),
      currentAv: measureToString(geologyInterval.currentAv),
      rpmAv: measureToString(geologyInterval.rpmAv),
      wtMudAv: measureToString(geologyInterval.wtMudAv),
      ecdTdAv: measureToString(geologyInterval.ecdTdAv),
      dxcAv: geologyInterval.dxcAv,
      uid: geologyInterval.uid,
      inset: geologyInterval.lithologies.map((lithology) => {
        return {
          id: lithology.uid,
          type: lithology.type,
          codeLith: lithology.codeLith,
          lithPc: lithology.lithPc
        };
      }),
      geologyInterval
    };
  });

  const insetColumns: ContentTableColumn[] = [
    { property: "type", label: "type", type: ContentType.String },
    { property: "codeLith", label: "codeLith", type: ContentType.Number },
    { property: "lithPc", label: "lithPc %", type: ContentType.Number }
  ];

  return selectedMudLog && !isFetchingData ? (
    <ContentTable
      viewId="mudLogView"
      columns={columns}
      data={geologyIntervalRows}
      onContextMenu={onContextMenu}
      checkableRows
      insetColumns={insetColumns}
      downloadToCsvFileName={`MudLog_${selectedMudLog.name}`}
    />
  ) : (
    <></>
  );
};

export default MudLogView;
