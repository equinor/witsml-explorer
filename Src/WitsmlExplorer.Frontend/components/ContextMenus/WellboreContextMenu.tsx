import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { WITSML_INDEX_TYPE_MD } from "components/Constants";
import {
  ObjectTypeToTemplateObject,
  StoreFunction,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import { WellboreRow } from "components/ContentViews/WellboresListView";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText
} from "components/ContextMenus/ContextMenuUtils";
import {
  copyWellbore,
  pasteObjectOnWellbore
} from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardReferences } from "components/ContextMenus/UseClipboardReferences";
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
  openObjectOnWellboreProperties,
  openWellboreProperties
} from "components/Modals/PropertiesModal/openPropertiesHelpers";
import { useConnectedServer } from "contexts/connectedServerContext";
import { DisplayModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { refreshWellboresQuery } from "hooks/query/queryRefreshHelpers";
import { useGetCapObjects } from "hooks/query/useGetCapObjects";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { useOperationState } from "hooks/useOperationState";
import { useServerFilter } from "hooks/useServerFilter";
import { IndexCurve } from "models/indexCurve";
import { DeleteWellboreJob } from "models/jobs/deleteJobs";
import { toWellboreReference } from "models/jobs/wellboreReference";
import LogObject from "models/logObject";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Wellbore from "models/wellbore";
import React from "react";
import { getObjectGroupsViewPath } from "routes/utils/pathBuilder";
import JobService, { JobType } from "services/jobService";
import { colors } from "styles/Colors";
import { openRouteInNewWindow } from "tools/windowHelpers";
import { v4 as uuid } from "uuid";
import WellboreUidMappingModal, {
  WellboreUidMappingModalProps
} from "../Modals/WellboreUidMappingModal.tsx";
import { getTargetWellboreID } from "./UidMappingUtils.tsx";

export interface WellboreContextMenuProps {
  servers: Server[];
  wellbore: Wellbore;
  checkedWellboreRows?: WellboreRow[];
}

const WellboreContextMenu = (
  props: WellboreContextMenuProps
): React.ReactElement => {
  const { wellbore, checkedWellboreRows, servers } = props;
  const { dispatchOperation } = useOperationState();
  const openInQueryView = useOpenInQueryView();
  const objectReferences = useClipboardReferences();
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();
  const { capObjects } = useGetCapObjects(connectedServer, {
    placeholderData: Object.entries(ObjectType)
  });
  const filteredServers = useServerFilter(servers);

  const onClickNewWellbore = () => {
    const newWellbore: Wellbore = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreParentUid: wellbore.uid,
      wellboreParentName: wellbore.name,
      wellborePurpose: "unknown"
    };
    openWellboreProperties(
      newWellbore,
      dispatchOperation,
      PropertiesModalMode.New
    );
  };

  const onClickNewLog = () => {
    const newLog: LogObject = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      indexType: WITSML_INDEX_TYPE_MD,
      indexCurve: IndexCurve.Depth
    };
    openObjectOnWellboreProperties(
      ObjectType.Log,
      newLog,
      dispatchOperation,
      PropertiesModalMode.New
    );
  };

  const deleteWellbore = async (cascadedDelete: boolean) => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    dispatchOperation({ type: OperationType.HideModal });
    const job: DeleteWellboreJob = {
      toDelete: {
        wellUid: wellbore.wellUid,
        wellboreUid: wellbore.uid,
        wellName: wellbore.wellName,
        wellboreName: wellbore.name
      },
      cascadedDelete
    };
    await JobService.orderJob(JobType.DeleteWellbore, job);
  };

  const onClickDelete = async () => {
    const userCredentialsModalProps: ConfirmDeletionModalProps = {
      componentType: "wellbore",
      objectName: wellbore.name,
      objectUid: wellbore.uid,
      onSubmit(cascadedDelete) {
        deleteWellbore(cascadedDelete);
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ConfirmDeletionModal {...userCredentialsModalProps} />
    });
  };

  const onClickDeleteEmptyMnemonics = async () => {
    const deleteEmptyMnemonicsModalProps: DeleteEmptyMnemonicsModalProps = {
      wellbores: [wellbore]
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <DeleteEmptyMnemonicsModal {...deleteEmptyMnemonicsModalProps} />
    };
    dispatchOperation(action);
  };

  const onClickRefresh = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    refreshWellboresQuery(queryClient, connectedServer?.url, wellbore.wellUid);
  };

  const onClickMissingDataAgent = () => {
    const wellboreReferences = checkedWellboreRows?.map((row) => ({
      wellUid: row.wellUid,
      wellboreUid: row.uid,
      wellName: row.wellName,
      wellboreName: row.name
    })) || [
      {
        wellUid: wellbore.wellUid,
        wellboreUid: wellbore.uid,
        wellName: wellbore.wellName,
        wellboreName: wellbore.name
      }
    ];
    const missingDataAgentModalProps: MissingDataAgentModalProps = {
      wellReferences: [],
      wellboreReferences: wellboreReferences
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <MissingDataAgentModal {...missingDataAgentModalProps} />
    });
  };

  const onClickCopyWellbore = () => {
    copyWellbore(wellbore, connectedServer, dispatchOperation);
  };

  const onClickShowOnServer = async (server: Server) => {
    dispatchOperation({ type: OperationType.HideContextMenu });

    const { targetWellId, targetWellboreId } = await getTargetWellboreID({
      sourceServerId: connectedServer.id,
      sourceWellId: wellbore.wellUid,
      sourceWellboreId: wellbore.uid,
      targetServerId: server.id
    });

    const objectGroupsViewPath = getObjectGroupsViewPath(
      server.url,
      targetWellId,
      targetWellboreId
    );

    openRouteInNewWindow(objectGroupsViewPath);
  };

  const onClickMapUidOnServer = async (wellbore: Wellbore, server: Server) => {
    dispatchOperation({ type: OperationType.HideContextMenu });

    const wellboreUidMappingModalProps: WellboreUidMappingModalProps = {
      wellbore: wellbore,
      targetServer: server
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <WellboreUidMappingModal {...wellboreUidMappingModalProps} />
    };
    dispatchOperation(action);
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"refreshwellbores"} onClick={onClickRefresh}>
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Refresh wellbores</Typography>
        </MenuItem>,
        <MenuItem key={"newwellbore"} onClick={onClickNewWellbore}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"newlog"} onClick={onClickNewLog}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New log</Typography>
        </MenuItem>,
        <MenuItem
          key={"paste"}
          onClick={() =>
            pasteObjectOnWellbore(
              servers,
              objectReferences,
              dispatchOperation,
              toWellboreReference(wellbore),
              connectedServer
            )
          }
          disabled={objectReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "paste",
              objectReferences?.objectType ?? "",
              objectReferences?.objectUids
            )}
          </Typography>
        </MenuItem>,
        <MenuItem
          key={"deleteWellbore"}
          onClick={onClickDelete}
          disabled={!!checkedWellboreRows && checkedWellboreRows.length !== 1}
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
        <NestedMenuItem
          key={"mapUidOnServer"}
          label={"Map UID From Server"}
          icon={"link"}
        >
          {servers
            .filter((server: Server) => server.id != connectedServer.id)
            .map((server: Server) => (
              <MenuItem
                key={server.name}
                onClick={() => onClickMapUidOnServer(wellbore, server)}
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
                  templateObject: TemplateObjects.Wellbore,
                  storeFunction: StoreFunction.GetFromStore,
                  wellUid: wellbore.wellUid,
                  wellboreUid: wellbore.uid
                })
              }
              disabled={
                !!checkedWellboreRows && checkedWellboreRows.length !== 1
              }
            >
              <StyledIcon
                name="textField"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>Open in query view</Typography>
            </MenuItem>,
            <MenuItem
              key={"newWellbore"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Wellbore,
                  storeFunction: StoreFunction.AddToStore,
                  wellUid: wellbore.wellUid,
                  wellboreUid: uuid()
                })
              }
            >
              <StyledIcon
                name="add"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>New Wellbore</Typography>
            </MenuItem>,
            <NestedMenuItem
              key={"newObjects"}
              label={"New object"}
              icon={"add"}
              disabled={
                !!checkedWellboreRows && checkedWellboreRows.length !== 1
              }
            >
              {Object.values(ObjectType)
                .filter((objectType) => capObjects.includes(objectType))
                .map((objectType) => (
                  <MenuItem
                    key={objectType}
                    onClick={() =>
                      openInQueryView({
                        templateObject: ObjectTypeToTemplateObject[objectType],
                        storeFunction: StoreFunction.AddToStore,
                        wellUid: wellbore.wellUid,
                        wellboreUid: wellbore.uid,
                        objectUid: uuid()
                      })
                    }
                    disabled={
                      !!checkedWellboreRows && checkedWellboreRows.length !== 1
                    }
                  >
                    <StyledIcon
                      name="add"
                      color={colors.interactive.primaryResting}
                    />
                    <Typography
                      color={"primary"}
                    >{`New ${objectType}`}</Typography>
                  </MenuItem>
                ))}
            </NestedMenuItem>
          ]}
        </NestedMenuItem>,
        <MenuItem key={"missingDataAgent"} onClick={onClickMissingDataAgent}>
          <StyledIcon name="search" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Missing Data Agent</Typography>
        </MenuItem>,
        <MenuItem key={"copyWellbore"} onClick={onClickCopyWellbore}>
          <StyledIcon name="copy" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Copy wellbore</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem
          key={"properties"}
          onClick={() => openWellboreProperties(wellbore, dispatchOperation)}
        >
          <StyledIcon
            name="settings"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WellboreContextMenu;
