import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentType } from "./table";
import Tubular from "../../models/tubular";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";
import OperationContext from "../../contexts/operationContext";
import TubularObjectContextMenu, { TubularObjectContextMenuProps } from "../ContextMenus/TubularObjectContextMenu";

export const TubularsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, selectedWell, selectedWellbore, selectedTubularGroup, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [tubulars, setTubulars] = useState<Tubular[]>([]);

  useEffect(() => {
    if (selectedWellbore?.tubulars) {
      setTubulars(selectedWellbore.tubulars);
    }
  }, [selectedWellbore?.tubulars]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, tubulars: Tubular[]) => {
    const contextProps: TubularObjectContextMenuProps = { dispatchNavigation, dispatchOperation, selectedServer, tubulars, wellbore: selectedWellbore, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TubularObjectContextMenu {...contextProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Tubular name", type: ContentType.String },
    { property: "typeTubularAssy", label: "typeTubularAssy", type: ContentType.String },
    { property: "uid", label: "UID", type: ContentType.String }
  ];

  const onSelect = (tubular: any) => {
    dispatchNavigation({
      type: NavigationType.SelectTubular,
      payload: { well: selectedWell, wellbore: selectedWellbore, tubularGroup: selectedTubularGroup, tubular }
    });
  };

  const tubularRows = tubulars.map((tubular) => {
    return {
      ...tubular,
      id: tubular.uid
    };
  });

  return selectedWellbore && tubulars == selectedWellbore.tubulars ? (
    <ContentTable columns={columns} data={tubularRows} onSelect={onSelect} onContextMenu={onContextMenu} checkableRows />
  ) : (
    <></>
  );
};

export default TubularsListView;
