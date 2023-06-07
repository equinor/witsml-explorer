import React, { useContext } from "react";
import { useWellFilter } from "../../contexts/filter";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import Wellbore from "../../models/wellbore";
import WellboreService from "../../services/wellboreService";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import WellboreContextMenu, { WellboreContextMenuProps } from "../ContextMenus/WellboreContextMenu";
import formatDateString from "../DateFormatter";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const WellboresListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWell, servers } = navigationState;
  const [selectedWellFiltered] = useWellFilter(
    React.useMemo(() => [selectedWell], [selectedWell]),
    React.useMemo(() => ({ filterWellbores: true }), [])
  );
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
    const contextMenuProps: WellboreContextMenuProps = { dispatchNavigation, dispatchOperation, servers, wellbore };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellboreContextMenu {...contextMenuProps} />, position } });
  };

  const getTableData = () => {
    return selectedWellFiltered?.wellbores?.map((wellbore) => {
      return {
        ...wellbore,
        id: wellbore.uid,
        dateTimeCreation: formatDateString(wellbore.dateTimeCreation, timeZone),
        dateTimeLastChange: formatDateString(wellbore.dateTimeLastChange, timeZone)
      };
    });
  };

  const onSelect = async (wellbore: any) => {
    const wellboreObjects = await WellboreService.getWellboreObjects(selectedWell.uid, wellbore.uid);
    dispatchNavigation({
      type: NavigationType.SelectWellbore,
      payload: { well: selectedWell, wellbore, ...wellboreObjects }
    });
  };

  return selectedWell && <ContentTable columns={columns} data={getTableData()} onSelect={onSelect} onContextMenu={onContextMenu} />;
};

export default WellboresListView;
