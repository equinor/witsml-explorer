import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import WbGeometryObjectContextMenu from "components/ContextMenus/WbGeometryContextMenu";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import NavigationType from "contexts/navigationType";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { measureToString } from "models/measure";
import { ObjectType } from "models/objectType";
import WbGeometryObject from "models/wbGeometry";
import React, { useContext, useEffect, useState } from "react";

export interface WbGeometryObjectRow extends ContentTableRow, WbGeometryObject {
  wbGeometry: WbGeometryObject;
}

export const WbGeometriesListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
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
        mdBottom: measureToString(wbGeometry.mdBottom),
        gapAir: measureToString(wbGeometry.gapAir),
        dTimReport: formatDateString(
          wbGeometry.dTimReport,
          timeZone,
          dateTimeFormat
        ),
        itemState: wbGeometry.commonData.itemState,
        dTimCreation: formatDateString(
          wbGeometry.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          wbGeometry.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        ),
        id: wbGeometry.uid,
        wbGeometry: wbGeometry
      };
    });
  };

  const onSelect = (wbGeometry: any) => {
    dispatchNavigation({
      type: NavigationType.SelectObject,
      payload: {
        well: selectedWell,
        wellbore: selectedWellbore,
        object: wbGeometry,
        objectType: ObjectType.WbGeometry
      }
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "mdBottom", label: "mdBottom", type: ContentType.Measure },
    { property: "gapAir", label: "gapAir", type: ContentType.Measure },
    { property: "dTimReport", label: "dTimReport", type: ContentType.DateTime },
    {
      property: "itemState",
      label: "commonData.itemState",
      type: ContentType.String
    },
    {
      property: "dTimCreation",
      label: "commonData.dTimCreation",
      type: ContentType.DateTime
    },
    {
      property: "dTimLastChange",
      label: "commonData.dTimLastChange",
      type: ContentType.DateTime
    },
    { property: "uid", label: "uid", type: ContentType.String }
  ];

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedWbGeometryObjectRows: WbGeometryObjectRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedWbGeometryObjectRows.map((row) => row.wbGeometry),
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: {
        component: <WbGeometryObjectContextMenu {...contextProps} />,
        position
      }
    });
  };

  return (
    Object.is(selectedWellbore?.wbGeometries, wbGeometries) && (
      <ContentTable
        viewId="wbGeometriesListView"
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        onSelect={onSelect}
        checkableRows
        showRefresh
        downloadToCsvFileName="WbGeometries"
      />
    )
  );
};
export default WbGeometriesListView;
