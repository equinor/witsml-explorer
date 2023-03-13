import React, { useContext, useEffect, useState } from "react";
import NavigationContext from "../../contexts/navigationContext";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { ObjectType } from "../../models/objectType";
import Tubular from "../../models/tubular";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import TubularObjectContextMenu, { TubularObjectContextMenuProps } from "../ContextMenus/TubularObjectContextMenu";
import { ContentTable, ContentTableColumn, ContentType } from "./table";

export const TubularsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedServer, selectedWell, selectedWellbore, servers, wells } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [tubulars, setTubulars] = useState<Tubular[]>([]);

  useEffect(() => {
    if (selectedWellbore?.tubulars) {
      setTubulars(selectedWellbore.tubulars);
    }
  }, [selectedWellbore?.tubulars, wells]);

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, tubulars: Tubular[]) => {
    const contextProps: TubularObjectContextMenuProps = { dispatchNavigation, dispatchOperation, selectedServer, tubulars, wellbore: selectedWellbore, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <TubularObjectContextMenu {...contextProps} />, position } });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "typeTubularAssy", label: "typeTubularAssy", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const onSelect = (tubular: any) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: { well: selectedWell, wellbore: selectedWellbore, object: tubular, objectType: ObjectType.Tubular }
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
