import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React from "react";
import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreWbGeometrysAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteObjectsJob } from "../../models/jobs/deleteJobs";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import WbGeometryService from "../../services/wbGeometryService";
import { colors } from "../../styles/Colors";
import { WbGeometryObjectRow } from "../ContentViews/WbGeometrysListView";
import ConfirmModal from "../Modals/ConfirmModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import WbGeometryPropertiesModal, { WbGeometryPropertiesModalProps } from "../Modals/WbGeometryPropertiesModal";
import ContextMenu from "./ContextMenu";
import { onClickShowOnServer, StyledIcon } from "./ContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface WbGeometryObjectContextMenuProps {
  checkedWbGeometryObjectRows: WbGeometryObjectRow[];
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  dispatchNavigation: (action: UpdateWellboreWbGeometrysAction) => void;
  servers: Server[];
  selectedServer: Server;
}

const WbGeometryObjectContextMenu = (props: WbGeometryObjectContextMenuProps): React.ReactElement => {
  const { checkedWbGeometryObjectRows, dispatchOperation, dispatchNavigation, servers } = props;

  const onClickModify = async () => {
    const mode = PropertiesModalMode.Edit;
    const modifyWbGeometryObjectProps: WbGeometryPropertiesModalProps = { mode, wbGeometryObject: checkedWbGeometryObjectRows[0].wbGeometry, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WbGeometryPropertiesModal {...modifyWbGeometryObjectProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const deleteWbGeometrys = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteObjectsJob = {
      toDelete: {
        objectUids: checkedWbGeometryObjectRows.map((wbGeometry) => wbGeometry.uid),
        wellUid: checkedWbGeometryObjectRows[0].wellUid,
        wellboreUid: checkedWbGeometryObjectRows[0].wellboreUid,
        objectType: ObjectType.WbGeometry
      }
    };
    await JobService.orderJob(JobType.DeleteWbGeometrys, job);
    const freshWbGeometrys = await WbGeometryService.getWbGeometrys(checkedWbGeometryObjectRows[0].wbGeometry.wellUid, checkedWbGeometryObjectRows[0].wbGeometry.wellboreUid);
    dispatchNavigation({
      type: ModificationType.UpdateWbGeometryObjects,
      payload: {
        wellUid: job.toDelete.wellUid,
        wellboreUid: job.toDelete.wellboreUid,
        wbGeometrys: freshWbGeometrys
      }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete wellbore geometrie(s)?"}
        content={
          <span>
            This will permanently delete Wellbore Geometries: <strong>{checkedWbGeometryObjectRows.map((item) => item.uid).join(", ")}</strong>
          </span>
        }
        onConfirm={() => deleteWbGeometrys()}
        confirmColor={"secondary"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"delete"} onClick={onClickDelete} disabled={checkedWbGeometryObjectRows.length === 0}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={checkedWbGeometryObjectRows.length !== 1}>
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() =>
                onClickShowOnServer(
                  dispatchOperation,
                  server,
                  checkedWbGeometryObjectRows[0].wellUid,
                  checkedWbGeometryObjectRows[0].wellboreUid,
                  checkedWbGeometryObjectRows[0].uid,
                  "wbGeometryUid"
                )
              }
              disabled={checkedWbGeometryObjectRows.length !== 1}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickModify} disabled={checkedWbGeometryObjectRows.length !== 1}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WbGeometryObjectContextMenu;
