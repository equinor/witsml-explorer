import {
  ContentTable,
  ContentTableColumn,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import TubularContextMenu from "components/ContextMenus/TubularContextMenu";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { ObjectType } from "models/objectType";
import Tubular from "models/tubular";
import React, { useContext, useEffect, useState } from "react";

export const TubularsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWell, selectedWellbore, wells } = navigationState;
  const [tubulars, setTubulars] = useState<Tubular[]>([]);

  useEffect(() => {
    if (selectedWellbore?.tubulars) {
      setTubulars(selectedWellbore.tubulars);
    }
  }, [selectedWellbore?.tubulars, wells]);

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    tubulars: Tubular[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: tubulars,
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <TubularContextMenu {...contextProps} />, position }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    {
      property: "typeTubularAssy",
      label: "typeTubularAssy",
      type: ContentType.String
    },
    { property: "uid", label: "uid", type: ContentType.String },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    }
  ];

  const onSelect = (tubular: any) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        object: tubular,
        objectType: ObjectType.Tubular
      }
    });
  };

  const tubularRows = tubulars.map((tubular) => {
    return {
      ...tubular,
      dTimCreation: formatDateString(
        tubular.commonData.dTimCreation,
        timeZone,
        dateTimeFormat
      ),
      dTimLastChange: formatDateString(
        tubular.commonData.dTimLastChange,
        timeZone,
        dateTimeFormat
      ),
      id: tubular.uid
    };
  });

  return selectedWellbore && tubulars == selectedWellbore.tubulars ? (
    <ContentTable
      viewId="tubularsListView"
      columns={columns}
      data={tubularRows}
      onSelect={onSelect}
      onContextMenu={onContextMenu}
      checkableRows
      showRefresh
      downloadToCsvFileName="Tubulars"
    />
  ) : (
    <></>
  );
};

export default TubularsListView;
