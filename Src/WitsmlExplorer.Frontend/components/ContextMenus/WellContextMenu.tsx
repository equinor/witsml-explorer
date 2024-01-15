import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import {
  StoreFunction,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import { WellRow } from "components/ContentViews/WellsListView";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import ConfirmModal from "components/Modals/ConfirmModal";
import DeleteEmptyMnemonicsModal, {
  DeleteEmptyMnemonicsModalProps
} from "components/Modals/DeleteEmptyMnemonicsModal";
import MissingDataAgentModal, {
  MissingDataAgentModalProps
} from "components/Modals/MissingDataAgentModal";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import WellBatchUpdateModal, {
  WellBatchUpdateModalProps
} from "components/Modals/WellBatchUpdateModal";
import WellPropertiesModal, {
  WellPropertiesModalProps
} from "components/Modals/WellPropertiesModal";
import WellborePropertiesModal, {
  WellborePropertiesModalProps
} from "components/Modals/WellborePropertiesModal";
import ModificationType from "contexts/modificationType";
import NavigationContext from "contexts/navigationContext";
import { treeNodeIsExpanded } from "contexts/navigationStateReducer";
import NavigationType from "contexts/navigationType";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { DeleteWellJob } from "models/jobs/deleteJobs";
import { Server } from "models/server";
import Well from "models/well";
import Wellbore from "models/wellbore";
import React, { useContext } from "react";
import JobService, { JobType } from "services/jobService";
import WellService from "services/wellService";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface WellContextMenuProps {
  dispatchOperation: (
    action: DisplayModalAction | HideModalAction | HideContextMenuAction
  ) => void;
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
  const openInQueryView = useOpenInQueryView();

  const onClickNewWell = () => {
    const newWell: Well = {
      uid: uuid(),
      name: "",
      field: "",
      operator: "",
      country: "",
      timeZone: ""
    };
    const wellPropertiesModalProps: WellPropertiesModalProps = {
      mode: PropertiesModalMode.New,
      well: newWell,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <WellPropertiesModal {...wellPropertiesModalProps} />
    });
  };

  const onClickRefresh = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const nodeId = well.uid;
    if (treeNodeIsExpanded(expandedTreeNodes, nodeId)) {
      dispatchNavigation({
        type: NavigationType.CollapseTreeNodeChildren,
        payload: { nodeId }
      });
    }
    if (selectedWell?.uid == well.uid) {
      dispatchNavigation({
        type: NavigationType.SelectWell,
        payload: { well }
      });
    }

    const updatedWell = await WellService.getWell(well.uid);
    dispatchNavigation({
      type: ModificationType.UpdateWell,
      payload: { well: updatedWell, overrideWellbores: true }
    });
  };

  const onClickRefreshAll = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const updatedWells = await WellService.getWells();
    dispatchNavigation({
      type: ModificationType.UpdateWells,
      payload: { wells: updatedWells }
    });
    dispatchNavigation({
      type: NavigationType.SelectServer,
      payload: { server: selectedServer }
    });
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
    const wellborePropertiesModalProps: WellborePropertiesModalProps = {
      mode: PropertiesModalMode.New,
      wellbore: newWellbore,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <WellborePropertiesModal {...wellborePropertiesModalProps} />
    });
  };

  const deleteWell = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteWellJob = {
      toDelete: {
        wellUid: well.uid,
        wellName: well.name
      }
    };
    await JobService.orderJob(JobType.DeleteWell, job);
  };

  const onClickDelete = async () => {
    const confirmation = (
      <ConfirmModal
        heading={"Delete well?"}
        content={
          <span>
            This will permanently delete <strong>{well.name}</strong> with uid:{" "}
            <strong>{well.uid}</strong>
          </span>
        }
        onConfirm={deleteWell}
        confirmColor={"danger"}
        confirmText={"Delete well"}
        switchButtonPlaces={true}
      />
    );
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: confirmation
    });
  };

  const onClickDeleteEmptyMnemonics = async () => {
    const deleteEmptyMnemonicsModalProps: DeleteEmptyMnemonicsModalProps = {
      wells: [well]
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <DeleteEmptyMnemonicsModal {...deleteEmptyMnemonicsModalProps} />
    };
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
    const missingDataAgentModalProps: MissingDataAgentModalProps = {
      wellReferences: wellReferences,
      wellboreReferences: []
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <MissingDataAgentModal {...missingDataAgentModalProps} />
    });
  };

  const onClickProperties = () => {
    const wellPropertiesModalProps: WellPropertiesModalProps = {
      mode: PropertiesModalMode.Edit,
      well,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <WellPropertiesModal {...wellPropertiesModalProps} />
    });
  };

  const onClickShowOnServer = async (server: Server) => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const host = `${window.location.protocol}//${window.location.host}`;
    const wellUrl = `${host}/?serverUrl=${server.url}&wellUid=${well.uid}`;
    window.open(wellUrl);
  };

  const onClickBatchUpdate = () => {
    const wellBatchUpdateModalProps: WellBatchUpdateModalProps = {
      wellRows: checkedWellRows,
      dispatchOperation
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <WellBatchUpdateModal {...wellBatchUpdateModalProps} />
    });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refreshwell"} onClick={onClickRefresh}>
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Refresh well</Typography>
        </MenuItem>,
        <MenuItem key={"refreshallwells"} onClick={onClickRefreshAll}>
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
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
        <MenuItem key={"deleteWell"} onClick={onClickDelete}>
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Delete</Typography>
        </MenuItem>,
        <MenuItem
          key={"deleteEmptyMnemonics"}
          onClick={onClickDeleteEmptyMnemonics}
        >
          <StyledIcon
            name="deleteToTrash"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Delete empty mnemonics</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {servers.map((server: Server) => (
            <MenuItem
              key={server.name}
              onClick={() => onClickShowOnServer(server)}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          ))}
        </NestedMenuItem>,
        <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
          {[
            <MenuItem
              key={"openQuery"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Well,
                  storeFunction: StoreFunction.GetFromStore,
                  wellUid: well.uid
                })
              }
            >
              <StyledIcon
                name="textField"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>Open in query view</Typography>
            </MenuItem>,
            <MenuItem
              key={"newWell"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Well,
                  storeFunction: StoreFunction.AddToStore,
                  wellUid: uuid()
                })
              }
            >
              <StyledIcon
                name="add"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>New Well</Typography>
            </MenuItem>,
            <MenuItem
              key={"newWellbore"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Wellbore,
                  storeFunction: StoreFunction.AddToStore,
                  wellUid: well.uid,
                  wellboreUid: uuid()
                })
              }
            >
              <StyledIcon
                name="add"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>New Wellbore</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>,
        <MenuItem key={"missingDataAgent"} onClick={onClickMissingDataAgent}>
          <StyledIcon name="search" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Missing Data Agent</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties}>
          <StyledIcon
            name="settings"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>,
        checkedWellRows && (
          <MenuItem
            key={"batchUpdate"}
            onClick={onClickBatchUpdate}
            disabled={checkedWellRows.length == 0}
          >
            <StyledIcon
              name="settings"
              color={colors.interactive.primaryResting}
            />
            <Typography color={"primary"}>Batch Update</Typography>
          </MenuItem>
        )
      ]}
    />
  );
};

export default WellContextMenu;
