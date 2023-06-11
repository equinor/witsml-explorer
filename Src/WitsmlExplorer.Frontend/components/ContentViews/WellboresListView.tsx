import React, { useContext } from "react";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import Wellbore from "../../models/wellbore";
import ObjectService from "../../services/objectService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const WellboresListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell } = navigationState;
  const {
    dispatchOperation,
    operationState: { timeZone }
  } = useContext(OperationContext);

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "wellType", label: "typeWellbore", type: ContentType.String },
    { property: "wellStatus", label: "statusWellbore", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "dateTimeCreation", label: "commonData.dTimCreation", type: ContentType.DateTime },
    { property: "dateTimeLastChange", label: "commonData.dTimLastChange", type: ContentType.DateTime }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, wellbore: Wellbore) => {
    const contextMenuProps: WellboreContextMenuProps = { wellbore, well: selectedWell };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const getTableData = () => {
    return selectedWell.wellbores.map((wellbore) => {
      return {
        ...wellbore,
        id: wellbore.uid,
        dateTimeCreation: formatDateString(wellbore.dateTimeCreation, timeZone),
        dateTimeLastChange: formatDateString(wellbore.dateTimeLastChange, timeZone),
        wellbore: wellbore
      };
    });
  };

  const onSelect = async (wellboreRow: any) => {
    const wellbore: Wellbore = wellboreRow.wellbore;
    dispatchNavigation({
      type: NavigationType.SelectWellbore,
      payload: { well: selectedWell, wellbore }
    });
    if (wellbore.objectCount == null) {
      const objectCount = await ObjectService.getExpandableObjectsCount(wellbore);
      dispatchNavigation({ type: ModificationType.UpdateWellborePartial, payload: { wellboreUid: wellbore.uid, wellUid: wellbore.wellUid, wellboreProperties: { objectCount } } });
    }
  };

  return selectedWell && <ContentTable columns={columns} data={getTableData()} onSelect={onSelect} onContextMenu={onContextMenu} />;
};

export default WellboresListView;
