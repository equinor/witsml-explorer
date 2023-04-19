import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import WbGeometryObject from "../../models/wbGeometry";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WbGeometryObjectContextMenu, { WbGeometryObjectContextMenuProps } from "../ContextMenus/WbGeometryContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface WbGeometryObjectRow extends ContentTableRow, WbGeometryObject {
  wbGeometry: WbGeometryObject;
}

export const WbGeometrysListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone }
  } = useContext(OperationContext);
  const { selectedWellbore, selectedWell, selectedServer, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [wbGeometrys, setWbGeometrys] = useState<WbGeometryObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.wbGeometrys) {
      setWbGeometrys(selectedWellbore.wbGeometrys);
    }
  }, [selectedWellbore, selectedWellbore?.wbGeometrys]);

  const getTableData = () => {
    return wbGeometrys.map((wbGeometry) => {
      return {
        ...wbGeometry,
        itemState: wbGeometry.commonData.itemState,
        id: wbGeometry.uid,
        dTimCreation: formatDateString(wbGeometry.commonData.dTimCreation, timeZone),
        dTimLastChange: formatDateString(wbGeometry.commonData.dTimLastChange, timeZone),
        wbGeometry: wbGeometry
      };
    });
  };

  const onSelect = (wbGeometry: any) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: { well: selectedWell, wellbore: selectedWellbore, object: wbGeometry, objectType: ObjectType.WbGeometry }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "itemState", label: "commonData.itemState", type: ContentType.String },
    { property: "dTimCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dTimLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime }
  ];
  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedWbGeometryObjectRows: WbGeometryObjectRow[]) => {
    const contextProps: WbGeometryObjectContextMenuProps = {
      checkedWbGeometryObjects: checkedWbGeometryObjectRows.map((row) => row.wbGeometry),
      dispatchOperation,
      selectedServer,
      servers
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WbGeometryObjectContextMenu {...contextProps} />, position } });
  };

  return (
    Object.is(selectedWellbore?.wbGeometrys, wbGeometrys) && (
      <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} onSelect={onSelect} checkableRows />
    )
  );
};
export default WbGeometrysListView;
