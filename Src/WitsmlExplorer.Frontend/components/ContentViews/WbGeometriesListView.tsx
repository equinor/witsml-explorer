import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import WbGeometryObject from "../../models/wbGeometry";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import WbGeometryObjectContextMenu from "../ContextMenus/WbGeometryContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface WbGeometryObjectRow extends ContentTableRow, WbGeometryObject {
  wbGeometry: WbGeometryObject;
}

export const WbGeometriesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWellbore, selectedWell } = navigationState;
  const [wbGeometries, setWbGeometries] = useState<WbGeometryObject[]>([]);

  useEffect(() => {
    if (selectedWellbore?.wbGeometries) {
      setWbGeometries(selectedWellbore.wbGeometries);
    }
  }, [selectedWellbore, selectedWellbore?.wbGeometries]);

  const getTableData = () => {
    return wbGeometries.map((wbGeometry) => {
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
    const contextProps: ObjectContextMenuProps = { checkedObjects: checkedWbGeometryObjectRows.map((row) => row.wbGeometry), wellbore: selectedWellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WbGeometryObjectContextMenu {...contextProps} />, position } });
  };

  return (
    Object.is(selectedWellbore?.wbGeometries, wbGeometries) && (
      <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} onSelect={onSelect} checkableRows />
    )
  );
};
export default WbGeometriesListView;
