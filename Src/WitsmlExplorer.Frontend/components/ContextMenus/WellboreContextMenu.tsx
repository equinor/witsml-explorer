import { Typography } from "@equinor/eds-core-react";
import { Divider, ListItemIcon, MenuItem } from "@material-ui/core";
import React from "react";
import { v4 as uuid } from "uuid";
import ModificationType from "../../contexts/modificationType";
import { UpdateWellboreAction } from "../../contexts/navigationStateReducer";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteWellboreJob } from "../../models/jobs/deleteJobs";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import WellboreService from "../../services/wellboreService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import ConfirmModal from "../Modals/ConfirmModal";
import LogPropertiesModal, { IndexCurve, LogPropertiesModalInterface } from "../Modals/LogPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import WellborePropertiesModal, { WellborePropertiesModalProps } from "../Modals/WellborePropertiesModal";
import ContextMenu from "./ContextMenu";
import NestedMenuItem from "./NestedMenuItem";
import WellborePasteMenuItem from "./WellborePasteMenuItem";

export interface WellboreContextMenuProps {
  dispatchNavigation: (action: UpdateWellboreAction) => void;
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const WellboreContextMenu = (props: WellboreContextMenuProps): React.ReactElement => {
  const { dispatchNavigation, dispatchOperation, wellbore, servers } = props;

  const onClickNewWellbore = () => {
    const newWellbore: Wellbore = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellStatus: "",
      wellType: "",
      isActive: false,
      wellboreParentUid: wellbore.uid,
      wellboreParentName: wellbore.name,
      wellborePurpose: "unknown"
    };
    const wellborePropertiesModalProps: WellborePropertiesModalProps = { mode: PropertiesModalMode.New, wellbore: newWellbore, dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <WellborePropertiesModal {...wellborePropertiesModalProps} /> };
    dispatchOperation(action);
  };

  const onClickNewLog = () => {
    const newLog: LogObject = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      indexCurve: IndexCurve.Depth
    };
    const logPropertiesModalProps: LogPropertiesModalInterface = { mode: PropertiesModalMode.New, logObject: newLog, dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <LogPropertiesModal {...logPropertiesModalProps} /> };
    dispatchOperation(action);
  };

  const deleteWellbore = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteWellboreJob = {
      toDelete: {
        wellUid: wellbore.wellUid,
        wellboreUid: wellbore.uid,
        wellName: wellbore.wellName,
        wellboreName: wellbore.name
      }
    };
    await JobService.orderJob(JobType.DeleteWellbore, job);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete wellbore?"}
        content={
          <span>
            This will permanently delete <strong>{wellbore.name}</strong> with uid: <strong>{wellbore.uid}</strong>
          </span>
        }
        onConfirm={deleteWellbore}
        confirmColor={"danger"}
        confirmText={"Delete wellbore"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onClickRefresh = async () => {
    const refreshedWellbore = await WellboreService.getCompleteWellbore(wellbore.wellUid, wellbore.uid);
    dispatchNavigation({
      type: ModificationType.UpdateWellbore,
      payload: { wellbore: refreshedWellbore }
    });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickProperties = async () => {
    const controller = new AbortController();
    const detailedWellbore = await WellboreService.getWellbore(wellbore.wellUid, wellbore.uid, controller.signal);
    const wellborePropertiesModalProps: WellborePropertiesModalProps = { mode: PropertiesModalMode.Edit, wellbore: detailedWellbore, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WellborePropertiesModal {...wellborePropertiesModalProps} /> });
  };

  const onClickShowOnServer = async (server: Server) => {
    const host = `${window.location.protocol}//${window.location.host}`;
    const wellboreUrl = `${host}/?serverUrl=${server.url}&wellUid=${wellbore.wellUid}&wellboreUid=${wellbore.uid}`;
    window.open(wellboreUrl);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refreshwellbore"} onClick={onClickRefresh}>
          <ListItemIcon>
            <Icon name="refresh" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Refresh wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"newwellbore"} onClick={onClickNewWellbore}>
          <ListItemIcon>
            <Icon name="add" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>New wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"newlog"} onClick={onClickNewLog}>
          <ListItemIcon>
            <Icon name="add" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>New log</Typography>
        </MenuItem>,
        <WellborePasteMenuItem key={"pasteMenu"} dispatchOperation={dispatchOperation} servers={servers} wellbore={wellbore} />,
        <MenuItem key={"deleteWellbore"} onClick={onClickDelete}>
          <ListItemIcon>
            <Icon name="deleteToTrash" color={colors.interactive.primaryResting} />
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
            <Icon name="settings" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WellboreContextMenu;
