import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import { v4 as uuid } from "uuid";
import ModificationType from "../../contexts/modificationType";
import NavigationContext from "../../contexts/navigationContext";
import { treeNodeIsExpanded } from "../../contexts/navigationStateReducer";
import NavigationType from "../../contexts/navigationType";
import OperationContext from "../../contexts/operationContext";
import { DisplayModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { DeleteWellboreJob } from "../../models/jobs/deleteJobs";
import LogObject from "../../models/logObject";
import { Server } from "../../models/server";
import Well from "../../models/well";
import Wellbore, { calculateWellboreNodeId } from "../../models/wellbore";
import JobService, { JobType } from "../../services/jobService";
import ObjectService from "../../services/objectService";
import WellboreService from "../../services/wellboreService";
import { colors } from "../../styles/Colors";
import ConfirmModal from "../Modals/ConfirmModal";
import LogPropertiesModal, { IndexCurve, LogPropertiesModalInterface } from "../Modals/LogPropertiesModal";
import { PropertiesModalMode } from "../Modals/ModalParts";
import WellborePropertiesModal, { WellborePropertiesModalProps } from "../Modals/WellborePropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferences } from "./UseClipboardReferences";

export interface WellboreContextMenuProps {
  wellbore: Wellbore;
  well: Well;
}

const WellboreContextMenu = (props: WellboreContextMenuProps): React.ReactElement => {
  const { wellbore, well } = props;
  const {
    dispatchNavigation,
    navigationState: { servers, expandedTreeNodes, selectedWell, selectedWellbore }
  } = useContext(NavigationContext);
  const { dispatchOperation } = useContext(OperationContext);
  const objectReferences = useClipboardReferences();

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
    dispatchOperation({ type: OperationType.HideContextMenu });
    // toggle the wellbore node and navigate to parent wellbore to reset the sidebar and content view
    //   because we do not load in objects that have been loaded in before the refresh
    const nodeId = calculateWellboreNodeId(wellbore);
    if (treeNodeIsExpanded(expandedTreeNodes, nodeId)) {
      dispatchNavigation({
        type: NavigationType.CollapseTreeNodeChildren,
        payload: { nodeId }
      });
    }
    if (selectedWell?.uid == well.uid && selectedWellbore?.uid == wellbore.uid) {
      dispatchNavigation({
        type: NavigationType.SelectWellbore,
        payload: { well, wellbore }
      });
    }

    const refreshedWellbore = await WellboreService.getWellbore(wellbore.wellUid, wellbore.uid);
    const objectCount = await ObjectService.getExpandableObjectsCount(wellbore);
    dispatchNavigation({
      type: ModificationType.UpdateWellbore,
      payload: { wellbore: { ...refreshedWellbore, objectCount } }
    });
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
          <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Refresh wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"newwellbore"} onClick={onClickNewWellbore}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New wellbore</Typography>
        </MenuItem>,
        <MenuItem key={"newlog"} onClick={onClickNewLog}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New log</Typography>
        </MenuItem>,
        <MenuItem key={"paste"} onClick={() => pasteObjectOnWellbore(servers, objectReferences, dispatchOperation, wellbore)} disabled={objectReferences === null}>
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", objectReferences?.objectType ?? "", objectReferences?.objectUids)}</Typography>
        </MenuItem>,
        <MenuItem key={"deleteWellbore"} onClick={onClickDelete}>
          <StyledIcon name="deleteToTrash" color={colors.interactive.primaryResting} />
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
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default WellboreContextMenu;
