import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import { treeNodeIsExpanded } from "../../contexts/navigationStateReducer";
import NavigationType from "../../contexts/navigationType";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteWellJob } from "../../models/jobs/deleteJobs";
import { Server } from "../../models/server";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import WellService from "../../services/wellService";
import { colors } from "../../styles/Colors";
import { WellRow } from "../ContentViews/WellsListView";
import ConfirmModal from "../Modals/ConfirmModal";
import DeleteEmptyMnemonicsModal, { DeleteEmptyMnemonicsModalProps } from "../Modals/DeleteEmptyMnemonicsModal";
import MissingDataAgentModal, { MissingDataAgentModalProps } from "../Modals/MissingDataAgentModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import WellBatchUpdateModal, { WellBatchUpdateModalProps } from "../Modals/WellBatchUpdateModal";
import WellPropertiesModal, { WellPropertiesModalProps } from "../Modals/WellPropertiesModal";
import WellborePropertiesModal, { WellborePropertiesModalProps } from "../Modals/WellborePropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface WellContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideModalAction | HideContextMenuAction) => void;
  well: Well;
  servers?: Server[];
  checkedWellRows?: WellRow[];
}

const WellContextMenu = (props: WellContextMenuProps): React.ReactElement => {
  const { dispatchOperation, well, servers, checkedWellRows } = props;
  const {
    dispatchNavigation,
    navigationState: { expandedTreeNodes, selectedServer, selectedWell }
  } = useContext(NavigationContext);

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

  const onClickRefresh = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const nodeId = well.uid;
    if (treeNodeIsExpanded(expandedTreeNodes, nodeId)) {
      dispatchNavigation({ type: NavigationType.CollapseTreeNodeChildren, payload: { nodeId } });
    }
    if (selectedWell?.uid == well.uid) {
      dispatchNavigation({ type: NavigationType.SelectWell, payload: { well } });
    }

    WellService.getWell(well.uid).then((response) => dispatchNavigation({ type: ModificationType.UpdateWell, payload: { well: response, overrideWellbores: true } }));
  };

  const onClickRefreshAll = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    WellService.getWells().then((response) => dispatchNavigation({ type: ModificationType.UpdateWells, payload: { wells: response } }));
    dispatchNavigation({ type: NavigationType.SelectServer, payload: { server: selectedServer } });
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

  const onClickDeleteEmptyMnemonics = async () => {
    const deleteEmptyMnemonicsModalProps: DeleteEmptyMnemonicsModalProps = { wells: [well], dispatchOperation: dispatchOperation };
    const action: DisplayModalAction = { type: OperationType.DisplayModal, payload: <DeleteEmptyMnemonicsModal {...deleteEmptyMnemonicsModalProps} /> };
    dispatchOperation(action);
  };

  const onClickMissingDataAgent = () => {
    const wellReferences = checkedWellRows?.map((row) => ({
      wellUid: row.uid,
      wellName: row.name
    })) || [
      {
        wellUid: well.uid,
        wellName: well.name
      }
    ];
    const missingDataAgentModalProps: MissingDataAgentModalProps = { wellReferences: wellReferences, wellboreReferences: [] };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <MissingDataAgentModal {...missingDataAgentModalProps} /> });
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
        <MenuItem key={"refreshwell"} onClick={onClickRefresh}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh well</Typography>
        </MenuItem>,
        <MenuItem key={"refreshallwells"} onClick={onClickRefreshAll}>
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh all wells</Typography>
        </MenuItem>,
        <MenuItem key={"newWell"} onClick={onClickNewWell}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Well</Typography>
        </MenuItem>,
        <MenuItem key={"newWellbore"} onClick={onClickNewWellbore}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"deletelogobject"} onClick={onClickDelete}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <MenuItem key={"deleteEmptyMnemonics"} onClick={onClickDeleteEmptyMnemonics}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Delete empty mnemonics</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem key={server.name} onClick={() => onClickShowOnServer(server)}>
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <MenuItem key={"missingDataAgent"} onClick={onClickMissingDataAgent}>
          <StyledIcon name="search" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Missing Data Agent</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>,
        checkedWellRows && (
          <MenuItem key={"batchUpdate"} onClick={onClickBatchUpdate} disabled={checkedWellRows.length == 0}>
            <StyledIcon name="settings" color={colors.interactive.primaryResting} />
            <Typography color={"primary"}>Batch Update</Typography>
          </MenuItem>
        )
      ]}
    />
  );
};

export default WellContextMenu;
