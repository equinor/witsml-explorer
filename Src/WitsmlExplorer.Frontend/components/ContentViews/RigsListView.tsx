import React, { useContext, useEffect, useState } from "react";
import { ContentTable, ContentTableColumn, ContentTableRow, ContentType } from "./table";
import Rig from "../../models/rig";
import NavigationContext from "../../contexts/navigationContext";

import { RigContextMenuProps } from "../ContextMenus/RigContextMenu";
import OperationContext from "../../contexts/operationContext";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import OperationType from "../../contexts/operationType";
import RigContextMenu from "../ContextMenus/RigContextMenu";

export interface RigRow extends ContentTableRow, Rig {
  rig: Rig;
}

export const RigsListView = (): React.ReactElement => {
  const { navigationState, dispatchNavigation } = useContext(NavigationContext);
  const { selectedWellbore, selectedServer, servers } = navigationState;
  const { dispatchOperation } = useContext(OperationContext);
  const [rigs, setRigs] = useState<Rig[]>([]);

  useEffect(() => {
    if (selectedWellbore && selectedWellbore.rigs) {
      setRigs(selectedWellbore.rigs);
    }
  }, []);
  const getTableData = () => {
    return rigs.map((rig) => {
      return {
        ...rig,
        id: rig.uid,
        ratingDrillDepth: `${rig.ratingDrillDepth?.value ?? ""} ${rig.ratingDrillDepth?.uom ?? ""}`,
        ratingWaterDepth: `${rig.ratingWaterDepth?.value ?? ""} ${rig.ratingWaterDepth?.uom ?? ""}`,
        airGap: `${rig.airGap?.value ?? ""} ${rig.airGap?.uom ?? ""}`,
        rig: rig,
        isOffshore: `${rig.isOffshore ?? ""}`
      };
    });
  };

  const columns: ContentTableColumn[] = [
    { property: "name", label: "Name", type: ContentType.String },
    { property: "uid", label: "Uid", type: ContentType.String },
    { property: "owner", label: "Owner", type: ContentType.String },
    { property: "typeRig", label: "TypeRig", type: ContentType.String },
    { property: "manufacturer", label: "Manufacturer", type: ContentType.String },
    { property: "yearEntService", label: "YearEntService", type: ContentType.String },
    { property: "classRig", label: "ClassRig", type: ContentType.String },
    { property: "approvals", label: "Approvals", type: ContentType.String },
    { property: "registration", label: "Registration", type: ContentType.String },
    { property: "telNumber", label: "TelNumber", type: ContentType.String },
    { property: "faxNumber", label: "FaxNumber", type: ContentType.String },
    { property: "emailAddress", label: "EmailAddress", type: ContentType.String },
    { property: "nameContact", label: "NameContact", type: ContentType.String },
    { property: "ratingDrillDepth", label: "RatingDrillDepth", type: ContentType.String },
    { property: "ratingWaterDepth", label: "RatingWaterDepth", type: ContentType.String },
    { property: "isOffshore", label: "IsOffshore", type: ContentType.String },
    { property: "airGap", label: "AirGap", type: ContentType.String },
    { property: "dTimStartOp", label: "DateTimeStartOperating", type: ContentType.DateTime },
    { property: "dTimEndOp", label: "DateTimeEndOperating", type: ContentType.DateTime }
  ];

  const onContextMenu = (event: React.MouseEvent<HTMLLIElement>, {}, checkedRigRows: RigRow[]) => {
    const contextProps: RigContextMenuProps = { checkedRigRows, dispatchNavigation, dispatchOperation, selectedServer, servers };
    const position = getContextMenuPosition(event);
    dispatchOperation({ type: OperationType.DisplayContextMenu, payload: { component: <RigContextMenu {...contextProps} />, position } });
  };

  return <ContentTable columns={columns} data={getTableData()} onContextMenu={onContextMenu} checkableRows />;
};

export default RigsListView;
