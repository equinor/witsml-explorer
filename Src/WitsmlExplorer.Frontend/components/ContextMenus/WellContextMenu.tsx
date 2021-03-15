import React from "react";
import ContextMenu from "./ContextMenu";
import { Divider, ListItemIcon, MenuItem, Typography } from "@material-ui/core";
import WellPropertiesModal, { WellPropertiesModalMode, WellPropertiesModalProps } from "../Modals/WellPropertiesModal";
import { DeleteIcon, NewIcon, SettingsIcon } from "../Icons";
import OperationType from "../../contexts/operationType";
import Well from "../../models/well";
import { v4 as uuid } from "uuid";
import Wellbore from "../../models/wellbore";
import WellborePropertiesModal, { WellborePropertiesModalMode, WellborePropertiesModalProps } from "../Modals/WellborePropertiesModal";
import JobService, { JobType } from "../../services/jobService";
import ConfirmModal from "../Modals/ConfirmModal";
import DeleteWellJob from "../../models/jobs/deleteWellJob";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { Server } from "../../models/server";
import NestedMenuItem from "./NestedMenuItem";

export interface WellContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  well: Well;
  servers?: Server[];
}

const WellContextMenu = (props: WellContextMenuProps): React.ReactElement => {
  const { dispatchOperation, well, servers } = props;

  const onClickNewWell = () => {
    const newWell: Well = {
      uid: uuid(),
      name: "",
      field: "",
      operator: "",
      country: "",
      timeZone: ""
    };
    const wellPropertiesModalProps: WellPropertiesModalProps = { mode: WellPropertiesModalMode.New, well: newWell, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WellPropertiesModal {...wellPropertiesModalProps} /> });
  };

  const onClickNewWellbore = () => {
    const newWellbore: Wellbore = {
      uid: uuid(),
      name: "",
      wellUid: well.uid,
      wellName: well.name,
      wellStatus: "",
      wellType: "",
      isActive: "",
      wellboreParentUid: "",
      wellboreParentName: "",
      wellborePurpose: "unknown"
    };
    const wellborePropertiesModalProps: WellborePropertiesModalProps = { mode: WellborePropertiesModalMode.New, wellbore: newWellbore, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WellborePropertiesModal {...wellborePropertiesModalProps} /> });
  };

  const deleteWell = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteWellJob = {
      wellReference: {
        wellUid: well.uid
      }
    };
    await JobService.orderJob(JobType.DeleteWell, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete well?"}
        content={
          <span>
            This will permanently delete <strong>{well.name}</strong> with uid: <strong>{well.uid}</strong>
          </span>
        }
        onConfirm={deleteWell}
        confirmColor={"secondary"}
        confirmText={"Delete well"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onClickProperties = () => {
    const wellPropertiesModalProps: WellPropertiesModalProps = { mode: WellPropertiesModalMode.Edit, well, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WellPropertiesModal {...wellPropertiesModalProps} /> });
  };

  const onClickShowOnServer = async (server: Server) => {
    const host = `${window.location.protocol}//${window.location.host}`;
    const wellUrl = `${host}/?serverUrl=${server.url}&wellUid=${well.uid}`;
    window.open(wellUrl);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"newwell"} onClick={onClickNewWell}>
          <ListItemIcon>
            <NewIcon />
          </ListItemIcon>
          <Typography color={"primary"}>New Well</Typography>
        </MenuItem>,
        <MenuItem key={"newwellbore"} onClick={onClickNewWellbore}>
          <ListItemIcon>
            <NewIcon />
          </ListItemIcon>
          <Typography color={"primary"}>New Wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"deletelogobject"} onClick={onClickDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(server)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WellContextMenu;
