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
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationType from "contexts/operationType";
import { useGetObjects } from "hooks/query/useGetObjects";
import { useExpandSidebarNodes } from "hooks/useExpandObjectGroupNodes";
import { useOperationState } from "hooks/useOperationState";
import { ObjectType } from "models/objectType";
import Rig from "models/rig";
import { MouseEvent } from "react";
import { useParams } from "react-router-dom";

export interface RigRow extends ContentTableRow, Rig {
  rig: Rig;
}

export default function RigsListView() {
  const {
    operationState: { timeZone, dateTimeFormat },
    dispatchOperation
  } = useOperationState();
  const { wellUid, wellboreUid } = useParams();
  const { connectedServer } = useConnectedServer();
  const { objects: rigs } = useGetObjects(
    connectedServer,
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
      checkedObjects: checkedRigRows.map((row) => row.rig)
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
