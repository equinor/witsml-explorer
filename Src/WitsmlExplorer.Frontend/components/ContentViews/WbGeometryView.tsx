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
import { ProgressSpinnerOverlay } from "components/ProgressSpinner";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetComponents } from "hooks/query/useGetComponents";
import { useGetObject } from "hooks/query/useGetObject";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ComponentType } from "models/componentType";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import WbGeometrySection from "models/wbGeometrySection";
import React from "react";
import { useParams } from "react-router-dom";
import { ItemNotFound } from "routes/ItemNotFound";

interface WbGeometrySectionRow extends ContentTableRow {
  wbGeometrySection: WbGeometrySection;
}

export default function WbGeometryView() {
  const { dispatchOperation } = useOperationState();
  const { wellUid, wellboreUid, objectUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { object: wbGeometry, isFetched: isFetchedWbGeometry } = useGetObject(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.WbGeometry,
    objectUid
  );

  const { components: wbGeometrySections, isFetching } = useGetComponents(
    connectedServer,
    wellUid,
    wellboreUid,
    objectUid,
    ComponentType.WbGeometrySection,
    { placeholderData: [] }
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.WbGeometry);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedWbGeometrySections: WbGeometrySectionRow[]
  ) => {
    const contextMenuProps: WbGeometrySectionContextMenuProps = {
      checkedWbGeometrySections: checkedWbGeometrySections.map(
        (row) => row.wbGeometrySection
      ),
      wbGeometry
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

  if (isFetchedWbGeometry && !wbGeometry) {
    return <ItemNotFound itemType={ObjectType.WbGeometry} />;
  }

  return (
    <>
      {isFetching && <ProgressSpinnerOverlay message="Fetching Trajectory." />}
      <ContentTable
        viewId="wbGeometryView"
        columns={columns}
        data={wbGeometrySectionRows}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName={`WbGeometry_${wbGeometry?.name}`}
      />
    </>
  );
}
