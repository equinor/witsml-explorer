import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useExpandObjectsGroupNodes } from "../../hooks/useExpandObjectGroupNodes";
import { ComponentType } from "../../models/componentType";
import { measureToString } from "../../models/measure";
import { ObjectType } from "../../models/objectType";
import WbGeometryObject from "../../models/wbGeometry";
import WbGeometrySection from "../../models/wbGeometrySection";
import ComponentService from "../../services/componentService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WbGeometrySectionContextMenu, {
  WbGeometrySectionContextMenuProps
} from "../ContextMenus/WbGeometrySectionContextMenu";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

interface WbGeometrySectionRow extends ContentTableRow {
  wbGeometrySection: WbGeometrySection;
}

export default function WbGeometryView() {
  const { navigationState } = useContext(NavigationContext);
  const { selectedObject, selectedServer, servers } = navigationState;
  const [wbGeometrySections, setWbGeometrySections] = useState<
    WbGeometrySection[]
  >([]);
  const { dispatchOperation } = useContext(OperationContext);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const selectedWbGeometry = selectedObject as WbGeometryObject;
  const { wellUid, wellboreUid, objectUid } = useParams();

  useExpandObjectsGroupNodes(wellUid, wellboreUid, ObjectType.WbGeometry);

  useEffect(() => {
    setIsFetchingData(true);
    const abortController = new AbortController();
    const getWbGeometry = async () => {
      setWbGeometrySections(
        await ComponentService.getComponents(
          wellUid,
          wellboreUid,
          objectUid,
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
  }, [wellUid, wellboreUid, objectUid]);

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

  return (
    !isFetchingData && (
      <ContentTable
        viewId="wbGeometryView"
        columns={columns}
        data={wbGeometrySectionRows}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        // TODO: Fix downloadToCsvFileName
        downloadToCsvFileName={`WbGeometry_${objectUid}`}
      />
    )
  );
}
