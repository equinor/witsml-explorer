import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import WbGeometryObject from "../../models/wbGeometry";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WbGeometryObjectContextMenu, { WbGeometryObjectContextMenuProps } from "../ContextMenus/WbGeometryContextMenu";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";

export interface WbGeometryObjectRow extends ContentTableRow, WbGeometryObject {
  wbGeometry: WbGeometryObject;
}

export const WbGeometrysListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedWell, selectedServer, selectedWbGeometryGroup, servers } = navigationState;
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

  const onSelect = (wbGeometry: any) => {
    dispatchNavigation({
      type: NavigationType.SelectWbGeometry,
      payload: { well: selectedWell, wellbore: selectedWellbore, wbGeometryGroup: selectedWbGeometryGroup, wbGeometry }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String },
    { property: "itemState", label: "Item State", type: ContentType.String }
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
