import { Typography } from "@equinor/eds-core-react";
import { Divider, ListItemIcon, MenuItem } from "@material-ui/core";
import React from "react";
import { v4 as uuid } from "uuid";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteWellJob } from "../../models/jobs/deleteJobs";
import { Server } from "../../models/server";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import Icon from "../../styles/Icons";
import { WellRow } from "../ContentViews/WellsListView";
import ConfirmModal from "../Modals/ConfirmModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import WellBatchUpdateModal, { WellBatchUpdateModalProps } from "../Modals/WellBatchUpdateModal";
import WellborePropertiesModal, { WellborePropertiesModalProps } from "../Modals/WellborePropertiesModal";
import WellPropertiesModal, { WellPropertiesModalProps } from "../Modals/WellPropertiesModal";
import ContextMenu from "./ContextMenu";
import NestedMenuItem from "./NestedMenuItem";

export interface WellContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  well: Well;
  servers?: Server[];
  checkedWellRows?: WellRow[];
}

const WellContextMenu = (props: WellContextMenuProps): React.ReactElement => {
  const { dispatchOperation, well, servers, checkedWellRows } = props;

  const onClickNewWell = () => {
    const newWell: Well = {
      uid: uuid(),
      name: "",
      field: "",
      operator: "",
      country: "",
      timeZone: ""
    };
    const wellPropertiesModalProps: WellPropertiesModalProps = { mode: PropertiesModalMode.New, well: newWell, dispatchOperation };
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
      isActive: false,
      wellboreParentUid: "",
      wellboreParentName: "",
      wellborePurpose: "unknown"
    };
    const wellborePropertiesModalProps: WellborePropertiesModalProps = { mode: PropertiesModalMode.New, wellbore: newWellbore, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WellborePropertiesModal {...wellborePropertiesModalProps} /> });
  };

  const deleteWell = async () => {
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteWellJob = {
      toDelete: {
        wellUid: well.uid,
        wellName: well.name
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
        confirmColor={"danger"}
        confirmText={"Delete well"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
  };

  const onClickProperties = () => {
    const wellPropertiesModalProps: WellPropertiesModalProps = { mode: PropertiesModalMode.Edit, well, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WellPropertiesModal {...wellPropertiesModalProps} /> });
  };

  const onClickShowOnServer = async (server: Server) => {
    const host = `${window.location.protocol}//${window.location.host}`;
    const wellUrl = `${host}/?serverUrl=${server.url}&wellUid=${well.uid}`;
    window.open(wellUrl);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  const onClickBatchUpdate = () => {
    const wellBatchUpdateModalProps: WellBatchUpdateModalProps = { wellRows: checkedWellRows, dispatchOperation };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <WellBatchUpdateModal {...wellBatchUpdateModalProps} /> });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"newWell"} onClick={onClickNewWell}>
          <ListItemIcon>
            <Icon name="add" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>New Well</Typography>
        </MenuItem>,
        <MenuItem key={"newWellbore"} onClick={onClickNewWellbore}>
          <ListItemIcon>
            <Icon name="add" color={colors.interactive.primaryResting} />
          </ListItemIcon>
          <Typography color={"primary"}>New Wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"deletelogobject"} onClick={onClickDelete}>
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
        </MenuItem>,
        checkedWellRows && (
          <MenuItem key={"batchUpdate"} onClick={onClickBatchUpdate} disabled={checkedWellRows.length == 0}>
            <ListItemIcon>
              <Icon name="settings" color={colors.interactive.primaryResting} />
            </ListItemIcon>
            <Typography color={"primary"}>Batch Update</Typography>
          </MenuItem>
        )
      ]}
    />
  );
};

export default WellContextMenu;
