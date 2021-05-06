import React, { useContext } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import Well from "../../models/well";
import WellContextMenu, { WellContextMenuProps } from "../ContextMenus/WellContextMenu";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";

export interface WellRow extends ContentTableRow, Well {}

export const WellsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const { filteredWells } = navigationState;

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "field", label: "Field", type: ContentType.String },
    { property: "operator", label: "Operator", type: ContentType.String },
    { property: "timeZone", label: "Time zone", type: ContentType.String },
    { property: "uid", label: "UID Well", type: ContentType.String },
    { property: "dateTimeCreation", label: "Creation date", type: ContentType.Date },
    { property: "dateTimeLastChange", label: "Last changed", type: ContentType.Date }
  ];

  const onSelect = (well: any) => {
    dispatchNavigation({ type: NavigationType.SelectWell, payload: { well, wellbores: well.wellbores } });
  };

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, well: Well, checkedWellRows: WellRow[]) => {
    const contextProps: WellContextMenuProps = { well, servers, dispatchOperation, checkedWellRows };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <WellContextMenu {...contextProps} />, position } });
  };

  const getTableData = () => {
    return filteredWells.map((well) => {
      return { id: well.uid, ...well };
    });
  };

  return <ContentTable columns={columns} data={getTableData()} onSelect={onSelect} onContextMenu={onContextMenu} checkableRows />;
};

export default WellsListView;
