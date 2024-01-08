import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import WbGeometrySectionContextMenu, {
  WbGeometrySectionContextMenuProps
} from "components/ContextMenus/WbGeometrySectionContextMenu";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { ComponentType } from "models/componentType";
import { measureToString } from "models/measure";
import WbGeometryObject from "models/wbGeometry";
import WbGeometrySection from "models/wbGeometrySection";
import React, { useContext, useEffect, useState } from "react";
import ComponentService from "services/componentService";

interface WbGeometrySectionRow extends ContentTableRow {
  wbGeometrySection: WbGeometrySection;
}

export const WbGeometryView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedObject, selectedServer, servers } = navigationState;
  const [wbGeometrySections, setWbGeometrySections] = useState<
    WbGeometrySection[]
  >([]);
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const selectedWbGeometry = selectedObject as WbGeometryObject;

  useEffect(() => {
    setIsFetchingData(true);
    if (selectedWbGeometry) {
      const abortController = new AbortController();

      const getWbGeometry = async () => {
        setWbGeometrySections(
          await ComponentService.getComponents(
            selectedWbGeometry.wellUid,
            selectedWbGeometry.wellboreUid,
            selectedWbGeometry.uid,
            ComponentType.WbGeometrySection,
            undefined,
            abortController.signal
          )
        );
        setIsFetchingData(false);
      };

      getWbGeometry();

      return function cleanup() {
        abortController.abort();
      };
    }
  }, [selectedWbGeometry]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedWbGeometrySections: WbGeometrySectionRow[]
  ) => {
    const contextMenuProps: WbGeometrySectionContextMenuProps = {
      checkedWbGeometrySections: checkedWbGeometrySections.map(
        (row) => row.wbGeometrySection
      ),
      dispatchOperation,
      wbGeometry: selectedWbGeometry,
      selectedServer,
      servers
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <WbGeometrySectionContextMenu {...contextMenuProps} />,
        position
      }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "uid", label: "uid", type: ContentType.String },
    {
      property: "typeHoleCasing",
      label: "typeHoleCasing",
      type: ContentType.String
    },
    { property: "mdTop", label: "mdTop", type: ContentType.Measure },
    { property: "mdBottom", label: "mdBottom", type: ContentType.Measure },
    { property: "tvdTop", label: "tvdTop", type: ContentType.Measure },
    { property: "tvdBottom", label: "tvdBottom", type: ContentType.Measure },
    { property: "idSection", label: "idSection", type: ContentType.Measure },
    { property: "odSection", label: "odSection", type: ContentType.Measure },
    { property: "wtPerLen", label: "wtPerLen", type: ContentType.Measure },
    { property: "grade", label: "grade", type: ContentType.String },
    {
      property: "curveConductor",
      label: "curveConductor",
      type: ContentType.String
    },
    { property: "diaDrift", label: "diaDrift", type: ContentType.Measure },
    { property: "factFric", label: "factFric", type: ContentType.Number }
  ];

  const wbGeometrySectionRows = wbGeometrySections.map((wbGeometrySection) => {
    return {
      id: wbGeometrySection.uid,
      uid: wbGeometrySection.uid,
      typeHoleCasing: wbGeometrySection.typeHoleCasing,
      mdTop: measureToString(wbGeometrySection.mdTop),
      mdBottom: measureToString(wbGeometrySection.mdBottom),
      tvdTop: measureToString(wbGeometrySection.tvdTop),
      tvdBottom: measureToString(wbGeometrySection.tvdBottom),
      idSection: measureToString(wbGeometrySection.idSection),
      odSection: measureToString(wbGeometrySection.odSection),
      wtPerLen: measureToString(wbGeometrySection.wtPerLen),
      grade: wbGeometrySection.grade,
      curveConductor:
        wbGeometrySection.curveConductor == null
          ? null
          : wbGeometrySection.curveConductor
          ? "true"
          : "false",
      diaDrift: measureToString(wbGeometrySection.diaDrift),
      factFric: wbGeometrySection.factFric,
      wbGeometrySection
    };
  });

  return selectedWbGeometry && !isFetchingData ? (
    <ContentTable
      viewId="wbGeometryView"
      columns={columns}
      data={wbGeometrySectionRows}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName={`WbGeometry_${selectedWbGeometry.name}`}
    />
  ) : (
    <></>
  );
};

export default WbGeometryView;
