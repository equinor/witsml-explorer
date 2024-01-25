import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "components/ContentViews/table";
import { getContextMenuPosition } from "components/ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import RigContextMenu from "components/ContextMenus/RigContextMenu";
import formatDateString from "components/DateFormatter";
import NavigationContext from "contexts/navigationContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import Rig from "models/rig";
import React, { useContext, useEffect, useState } from "react";

export interface RigRow extends ContentTableRow, Rig {
  rig: Rig;
}

export const RigsListView = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { selectedWellbore } = navigationState;
  const [rigs, setRigs] = useState<Rig[]>([]);

  useEffect(() => {
    if (selectedWellbore?.rigs) {
      setRigs(selectedWellbore.rigs);
    }
  }, [selectedWellbore]);

  const getTableData = () => {
    return rigs.map((rig) => {
      return {
        ...rig,
        id: rig.uid,
        ratingDrillDepth: `${rig.ratingDrillDepth?.value ?? ""} ${
          rig.ratingDrillDepth?.uom ?? ""
        }`,
        ratingWaterDepth: `${rig.ratingWaterDepth?.value ?? ""} ${
          rig.ratingWaterDepth?.uom ?? ""
        }`,
        airGap: `${rig.airGap?.value ?? ""} ${rig.airGap?.uom ?? ""}`,
        rig: rig,
        isOffshore: `${rig.isOffshore ?? ""}`,
        dTimStartOp: formatDateString(
          rig.dTimStartOp,
          timeZone,
          dateTimeFormat
        ),
        dTimEndOp: formatDateString(rig.dTimEndOp, timeZone, dateTimeFormat),
        dTimCreation: formatDateString(
          rig.commonData.dTimCreation,
          timeZone,
          dateTimeFormat
        ),
        dTimLastChange: formatDateString(
          rig.commonData.dTimLastChange,
          timeZone,
          dateTimeFormat
        )
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "name", type: ContentType.String },
    { property: "uid", label: "uid", type: ContentType.String },
    { property: "owner", label: "owner", type: ContentType.String },
    { property: "typeRig", label: "typeRig", type: ContentType.String },
    {
      property: "manufacturer",
      label: "manufacturer",
      type: ContentType.String
    },
    {
      property: "yearEntService",
      label: "yearEntService",
      type: ContentType.String
    },
    { property: "classRig", label: "classRig", type: ContentType.String },
    { property: "approvals", label: "approvals", type: ContentType.String },
    {
      property: "registration",
      label: "registration",
      type: ContentType.String
    },
    { property: "telNumber", label: "telNumber", type: ContentType.String },
    { property: "faxNumber", label: "faxNumber", type: ContentType.String },
    {
      property: "emailAddress",
      label: "emailAddress",
      type: ContentType.String
    },
    { property: "nameContact", label: "nameContact", type: ContentType.String },
    {
      property: "ratingDrillDepth",
      label: "ratingDrillDepth",
      type: ContentType.String
    },
    {
      property: "ratingWaterDepth",
      label: "ratingWaterDepth",
      type: ContentType.String
    },
    { property: "isOffshore", label: "isOffshore", type: ContentType.String },
    { property: "airGap", label: "airGap", type: ContentType.String },
    {
      property: "dTimStartOp",
      label: "dTimStartOp",
      type: ContentType.DateTime
    },
    { property: "dTimEndOp", label: "dTimEndOp", type: ContentType.DateTime },
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

  const onContextMenu = (
    event: React.MouseEvent<HTMLLIElement>,
    {},
    checkedRigRows: RigRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedRigRows.map((row) => row.rig),
      wellbore: selectedWellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <RigContextMenu {...contextProps} />, position }
    });
  };

  return (
    selectedWellbore &&
    Object.is(selectedWellbore.rigs, rigs) && (
      <ContentTable
        viewId="rigsListView"
        columns={columns}
        data={getTableData()}
        onContextMenu={onContextMenu}
        checkableRows
        showRefresh
        downloadToCsvFileName="Rigs"
      />
    )
  );
};

export default RigsListView;
