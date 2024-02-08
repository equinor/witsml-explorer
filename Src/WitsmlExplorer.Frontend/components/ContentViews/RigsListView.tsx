import { MouseEvent, useContext } from "react";
import { useParams } from "react-router-dom";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import OperationContext from "../../contexts/operationContext";
import OperationType from "../../contexts/operationType";
import { useGetObjects } from "../../hooks/query/useGetObjects";
import { useGetWellbore } from "../../hooks/query/useGetWellbore";
import { useExpandSidebarNodes } from "../../hooks/useExpandObjectGroupNodes";
import { ObjectType } from "../../models/objectType";
import Rig from "../../models/rig";
import { getContextMenuPosition } from "../ContextMenus/ContextMenu";
import { ObjectContextMenuProps } from "../ContextMenus/ObjectMenuItems";
import RigContextMenu from "../ContextMenus/RigContextMenu";
import formatDateString from "../DateFormatter";
import {
  ContentTable,
  ContentTableColumn,
  ContentTableRow,
  ContentType
} from "./table";

export interface RigRow extends ContentTableRow, Rig {
  rig: Rig;
}

export default function RigsListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useContext(OperationContext);
  const { wellUid, wellboreUid } = useParams();
  const { authorizationState } = useAuthorizationState();
  const { wellbore } = useGetWellbore(
    authorizationState?.server,
    wellUid,
    wellboreUid
  );

  const { objects: rigs } = useGetObjects(
    authorizationState?.server,
    wellUid,
    wellboreUid,
    ObjectType.Rig
  );

  useExpandSidebarNodes(wellUid, wellboreUid, ObjectType.Rig);

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
    event: MouseEvent<HTMLLIElement>,
    {},
    checkedRigRows: RigRow[]
  ) => {
    const contextProps: ObjectContextMenuProps = {
      checkedObjects: checkedRigRows.map((row) => row.rig),
      wellbore
    };
    const position = getContextMenuPosition(event);
    dispatchOperation({
      type: OperationType.DisplayContextMenu,
      payload: { component: <RigContextMenu {...contextProps} />, position }
    });
  };

  return (
    rigs && (
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
}
