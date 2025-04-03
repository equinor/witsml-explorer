import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import {
  StoreFunction,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import { WellRow } from "components/ContentViews/WellsListView";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import ConfirmDeletionModal, {
  ConfirmDeletionModalProps
} from "components/Modals/ConfirmDeletionModal";
import DeleteEmptyMnemonicsModal, {
  DeleteEmptyMnemonicsModalProps
} from "components/Modals/DeleteEmptyMnemonicsModal";
import MissingDataAgentModal, {
  MissingDataAgentModalProps
} from "components/Modals/MissingDataAgentModal";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import {
  openWellProperties,
  openWellboreProperties
} from "components/Modals/PropertiesModal/openPropertiesHelpers";
import WellBatchUpdateModal, {
  WellBatchUpdateModalProps
} from "components/Modals/WellBatchUpdateModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import {
  DisplayModalAction,
  HideContextMenuAction,
  HideModalAction
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { refreshWellsQuery } from "hooks/query/queryRefreshHelpers";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { useServerFilter } from "hooks/useServerFilter";
import { DeleteWellJob } from "models/jobs/deleteJobs";
import { Server } from "models/server";
import Well from "models/well";
import Wellbore from "models/wellbore";
import React from "react";
import { getWellboresViewPath } from "routes/utils/pathBuilder";
import JobService, { JobType } from "services/jobService";
import { colors } from "styles/Colors";
import { openRouteInNewWindow } from "tools/windowHelpers";
import { v4 as uuid } from "uuid";
import { useWellboreReference } from "./UseClipboardReferences";
import { pasteWellbore } from "./CopyUtils";

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
  const { connectedServer } = useConnectedServer();
  const openInQueryView = useOpenInQueryView();
  const queryClient = useQueryClient();
  const filteredServers = useServerFilter(servers);
  const wellboreReference = useWellboreReference();

  const onClickNewWell = () => {
    const newWell: Well = {
      uid: uuid(),
      name: "",
      field: "",
      operator: "",
      country: "",
      timeZone: ""
    };
    openWellProperties(newWell, dispatchOperation, PropertiesModalMode.New);
  };

  const onClickRefresh = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    refreshWellsQuery(queryClient, connectedServer?.url);
  };

  const onClickNewWellbore = () => {
    const newWellbore: Wellbore = {
      uid: uuid(),
      name: "",
      wellUid: well.uid,
      wellName: well.name,
      wellborePurpose: "unknown"
    };
    openWellboreProperties(
      newWellbore,
      dispatchOperation,
      PropertiesModalMode.New
    );
  };

  const deleteWell = async (cascadedDelete: boolean) => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteWellJob = {
      toDelete: {
        wellUid: well.uid,
        wellName: well.name
      },
      cascadedDelete
    };
    await JobService.orderJob(JobType.DeleteWell, job);
  };

  const onClickDelete = async () => {
    const userCredentialsModalProps: ConfirmDeletionModalProps = {
      componentType: "well",
      objectName: well.name,
      objectUid: well.uid,
      onSubmit(cascadedDelete) {
        deleteWell(cascadedDelete);
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ConfirmDeletionModal {...userCredentialsModalProps} />
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

  const onClickShowOnServer = async (server: Server) => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const wellboresViewPath = getWellboresViewPath(server.url, well.uid);
    openRouteInNewWindow(wellboresViewPath);
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
        <MenuItem
          key={"refreshwell"}
          onClick={onClickRefresh}
          disabled={!connectedServer?.url}
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Refresh wells</Typography>
        </MenuItem>,
        <MenuItem key={"newWell"} onClick={onClickNewWell}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Well</Typography>
        </MenuItem>,
        <MenuItem key={"newWellbore"} onClick={onClickNewWellbore}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Wellbore</Typography>
        </MenuItem>,
        <MenuItem
          key={"deleteWell"}
          onClick={onClickDelete}
          disabled={!!checkedWellRows && checkedWellRows.length !== 1}
        >
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
        <MenuItem
          key={"paste"}
          onClick={() => {
            pasteWellbore(servers, wellboreReference, dispatchOperation, well);
          }}
          disabled={wellboreReference === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Paste wellbore</Typography>
        </MenuItem>,
        <NestedMenuItem key={"showOnServer"} label={"Show on server"}>
          {filteredServers
            .filter((server: Server) => server.id != connectedServer.id)
            .map((server: Server) => (
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
              disabled={!!checkedWellRows && checkedWellRows?.length !== 1}
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
              disabled={!!checkedWellRows && checkedWellRows?.length !== 1}
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
        <MenuItem
          key={"properties"}
          onClick={() => openWellProperties(well, dispatchOperation)}
        >
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
