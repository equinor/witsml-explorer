import { MouseEvent, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import NavigationContext from "../../contexts/navigationContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { useGetObjects } from "../../hooks/useGetObjects";
import { measureToString } from "../../models/measure";
import { ObjectType } from "../../models/objectType";
import WbGeometryObject from "../../models/wbGeometry";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import WbGeometryObjectContextMenu from "../ContextMenus/WbGeometryContextMenu";
import formatDateString from "../DateFormatter";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface WbGeometryObjectRow extends ContentTableRow, WbGeometryObject {
  wbGeometry: WbGeometryObject;
}

export default function WbGeometriesListView() {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const navigate = useNavigate();
  const { authorizationState } = useAuthorizationState();
  const { wellUid, wellboreUid } = useParams();

  const wbGeometries = useGetObjects(
    wellUid,
    wellboreUid,
    ObjectType.WbGeometry
  ) as WbGeometryObject[];

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.WbGeometry);

  const getTableData = () => {
    return wbGeometries.map((wbGeometry) => {
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
      `/servers/${encodeURIComponent(
        authorizationState.server.url
      )}/wells/${wellUid}/wellbores/${wellboreUid}/objectgroups/${
        ObjectType.WbGeometry
      }/objects/${wbGeometry.uid}`
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
      checkedObjects: checkedWbGeometryObjectRows.map((row) => row.wbGeometry),
      wellbore: selectedWellbore
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
