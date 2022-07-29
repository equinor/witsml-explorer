import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import WbGeometryObject from "../../models/wbGeometry";
import WbGeometryObjectContextMenu, { WbGeometryObjectContextMenuProps } from "../ContextMenus/WbGeometryContextMenu";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";

export interface WbGeometryObjectRow extends ContentTableRow, WbGeometryObject {
  wbGeometry: WbGeometryObject;
}

export const WbGeometrysListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedServer, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [wbGeometrys, setWbGeometrys] = useState<WbGeometryObject[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.wbGeometrys) {
      setWbGeometrys(selectedWellbore.wbGeometrys);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return wbGeometrys.map((wbGeometry) => {
      return {
        ...wbGeometry,
        itemState: wbGeometry.commonData.itemState,
        id: wbGeometry.uid,
        wbGeometry: wbGeometry
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String },
    { property: "itemState", label: "Item State", type: ContentType.String }
  ];
  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedWbGeometryObjectRows: WbGeometryObjectRow[]) => {
    const contextProps: WbGeometryObjectContextMenuProps = { checkedWbGeometryObjectRows, dispatchNavigation, dispatchOperation, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WbGeometryObjectContextMenu {...contextProps} />, position } });
  };

  return Object.is(selectedWellbore.wbGeometrys, wbGeometrys) && <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};
export default WbGeometrysListView;
