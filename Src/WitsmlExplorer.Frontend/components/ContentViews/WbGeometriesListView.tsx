import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import WbGeometryObjectContextMenu from "components/ContextMenus/WbGeometryContextMenu";
import formatDateString from "components/DateFormatter";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import WbGeometryObject from "models/wbGeometry";
import { MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getObjectViewPath } from "routes/utils/pathBuilder";

export interface WbGeometryObjectRow extends ContentTableRow, WbGeometryObject {
  wbGeometry: WbGeometryObject;
}

export default function WbGeometriesListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const navigate = useNavigate();
  const { connectedServer } = useConnectedServer();
  const { wellUid, wellboreUid } = useParams();
  const { objects: wbGeometries } = useGetObjects(
    connectedServer,
    wellUid,
    wellboreUid,
    ObjectType.WbGeometry
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.WbGeometry);

  const getTableData = () => {
    return wbGeometries?.map((wbGeometry) => {
      return {
        ...wbGeometry,
        mdBottom: measureToString(wbGeometry.mdBottom),
        gapAir: measureToString(wbGeometry.gapAir),
        dTimReport: formatDateString(
          wbGeometry.dTimReport,
          timeZone,
          dateTimeFormat
        ),
        itemState: wbGeometry.commonData.itemState,
        dTimCreation: formatDateString(
          wbGeometry.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          wbGeometry.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        id: wbGeometry.uid,
        wbGeometry: wbGeometry
      };
    });
  };

  const onSelect = (wbGeometry: any) => {
    navigate(
      getObjectViewPath(
        connectedServer?.url,
        wellUid,
        wellboreUid,
        ObjectType.WbGeometry,
        wbGeometry.uid
      )
    );
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "mdBottom", label: "mdBottom", type: ContentType.Measure },
    { property: "gapAir", label: "gapAir", type: ContentType.Measure },
    { property: "dTimReport", label: "dTimReport", type: ContentType.DateTime },
    {
      property: "itemState",
      label: "commonData.itemState",
      type: ContentType.String
    },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const onContextMenu = (
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedWbGeometryObjectRows: WbGeometryObjectRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedWbGeometryObjectRows.map((row) => row.wbGeometry)
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <WbGeometryObjectContextMenu {...contextProps} />,
        position
      }
    });
  };

  return (
    wbGeometries && (
      <ContentTable
        viewId="wbGeometriesListView"
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        onSelect={onSelect}
        checkableRows
        showRefresh
        downloadToCsvFileName="WbGeometries"
      />
    )
  );
}
