import { Typography } from "@equinor/eds-core-react";
import { Divider, MenuItem } from "@mui/material";
import { QueryClient } from "@tanstack/react-query";
import { WITSML_INDEX_TYPE_MD } from "components/Constants";
import {
  ObjectTypeToTemplateObject,
  StoreFunction
} from "components/ContentViews/QueryViewUtils";
import {
  StyledIcon,
  menuItemText,
  onClickDeleteObjects,
  onClickRefreshObject,
  onClickShowObjectOnServer
} from "components/ContextMenus/ContextMenuUtils";
import { onClickCopyToServer } from "components/ContextMenus/CopyToServer";
import {
  copyObjectOnWellbore,
  pasteObjectOnWellbore
} from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardReferencesOfType } from "components/ContextMenus/UseClipboardReferences";
import { IndexCurve } from "components/Modals/LogPropertiesModal";
import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { OpenInQueryView } from "hooks/useOpenInQueryView";
import LogObject from "models/logObject";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import React from "react";
import {
  NavigateFunction,
  createSearchParams,
  useNavigate
} from "react-router-dom";
import { getLogCurveInfoListViewPath } from "routes/utils/pathBuilder";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface ObjectContextMenuProps {
  checkedObjects: ObjectOnWellbore[];
}

export const ObjectMenuItems = (
  checkedObjects: ObjectOnWellbore[],
  objectType: ObjectType,
  selectedServer: Server,
  servers: Server[],
  dispatchOperation: DispatchOperation,
  queryClient: QueryClient,
  openInQueryView: OpenInQueryView,
  extraMenuItems: React.ReactElement[]
): React.ReactElement[] => {
  const objectReferences = useClipboardReferencesOfType(objectType);
  const navigate = useNavigate();
  return [
    // ------- OPEN
    <MenuItem
      key={"open"}
      onClick={() =>
        onClickOpenSeveralLogs(
          dispatchOperation,
          //   queryClient,
          selectedServer.url,
          checkedObjects[0].wellUid,
          checkedObjects[0].wellboreUid,
          checkedObjects[0].uid,
          checkedObjects,
          navigate,
          (checkedObjects[0] as LogObject)?.indexType === WITSML_INDEX_TYPE_MD
            ? IndexCurve.Depth
            : IndexCurve.Time
        )
      }
      disabled={checkedObjects.length == 0}
    >
      <StyledIcon name="folderOpen" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>
        {menuItemText("Open", objectType, null)}
      </Typography>
    </MenuItem>,
    <MenuItem
      key={"refresh"}
      onClick={() =>
        onClickRefreshObject(
          dispatchOperation,
          queryClient,
          selectedServer.url,
          checkedObjects[0].wellUid,
          checkedObjects[0].wellboreUid,
          objectType
        )
      }
      disabled={checkedObjects.length !== 1}
    >
      <StyledIcon name="refresh" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>
        {menuItemText("Refresh", objectType, null)}
      </Typography>
    </MenuItem>,
    <Divider key={"objectMenuItemsDivider"} />,
    <MenuItem
      key={"copy"}
      onClick={() =>
        copyObjectOnWellbore(
          selectedServer,
          checkedObjects,
          dispatchOperation,
          objectType
        )
      }
      disabled={checkedObjects.length === 0}
    >
      <StyledIcon name="copy" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>
        {menuItemText("copy", objectType, checkedObjects)}
      </Typography>
    </MenuItem>,
    <NestedMenuItem
      key={"copyToServer"}
      label={`${menuItemText("copy", objectType, checkedObjects)} to server`}
      disabled={checkedObjects.length === 0}
    >
      {servers.map(
        (server: Server) =>
          server.id !== selectedServer.id && (
            <MenuItem
              key={server.name}
              onClick={() =>
                onClickCopyToServer(
                  server,
                  selectedServer,
                  checkedObjects,
                  objectType,
                  dispatchOperation
                )
              }
              disabled={checkedObjects.length === 0}
            >
              <Typography color={"primary"}>{server.name}</Typography>
            </MenuItem>
          )
      )}
    </NestedMenuItem>,
    <MenuItem
      key={"pasteObject"}
      onClick={() =>
        pasteObjectOnWellbore(servers, objectReferences, dispatchOperation, {
          wellUid: checkedObjects[0].wellUid,
          wellboreUid: checkedObjects[0].wellboreUid,
          wellName: checkedObjects[0].wellName,
          wellboreName: checkedObjects[0].wellboreName
        })
      }
      disabled={objectReferences === null}
    >
      <StyledIcon name="paste" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>
        {menuItemText("paste", objectType, objectReferences?.objectUids)}
      </Typography>
    </MenuItem>,
    <MenuItem
      key={"delete"}
      onClick={() =>
        onClickDeleteObjects(dispatchOperation, checkedObjects, objectType)
      }
      disabled={checkedObjects.length === 0}
    >
      <StyledIcon
        name="deleteToTrash"
        color={colors.interactive.primaryResting}
      />
      <Typography color={"primary"}>
        {menuItemText("delete", objectType, checkedObjects)}
      </Typography>
    </MenuItem>,
    ...extraMenuItems,
    <NestedMenuItem
      key={"showOnServer"}
      label={"Show on server"}
      disabled={checkedObjects.length !== 1}
    >
      {servers.map((server: Server) => (
        <MenuItem
          key={server.name}
          onClick={() =>
            onClickShowObjectOnServer(
              dispatchOperation,
              server,
              checkedObjects[0],
              objectType,
              (checkedObjects[0] as LogObject)?.indexType ===
                WITSML_INDEX_TYPE_MD
                ? IndexCurve.Depth
                : IndexCurve.Time
            )
          }
          disabled={checkedObjects.length !== 1}
        >
          <Typography color={"primary"}>{server.name}</Typography>
        </MenuItem>
      ))}
    </NestedMenuItem>,
    <NestedMenuItem
      key={"queryItems"}
      label={"Query"}
      icon="textField"
      disabled={checkedObjects.length !== 1}
    >
      {[
        <MenuItem
          key={"openInQueryView"}
          disabled={checkedObjects.length != 1}
          onClick={() =>
            openInQueryView({
              templateObject: ObjectTypeToTemplateObject[objectType],
              storeFunction: StoreFunction.GetFromStore,
              wellUid: checkedObjects[0].wellUid,
              wellboreUid: checkedObjects[0].wellboreUid,
              objectUid: checkedObjects[0].uid
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
          key={"newObject"}
          disabled={checkedObjects.length != 1}
          onClick={() =>
            openInQueryView({
              templateObject: ObjectTypeToTemplateObject[objectType],
              storeFunction: StoreFunction.AddToStore,
              wellUid: checkedObjects[0].wellUid,
              wellboreUid: checkedObjects[0].wellboreUid,
              objectUid: uuid()
            })
          }
        >
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{`New ${objectType}`}</Typography>
        </MenuItem>
      ]}
    </NestedMenuItem>
  ];
};

const onClickOpenSeveralLogs = (
  dispatchOperation: DispatchOperation,
  // queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  uid: string,
  checkedItems: ObjectOnWellbore[],
  navigate: NavigateFunction,
  indexCurve: IndexCurve = null
) => {
  dispatchOperation({ type: OperationType.HideContextMenu });
  const path = getLogCurveInfoListViewPath(
    serverUrl,
    wellUid,
    wellboreUid,
    ObjectType.Log,
    indexCurve,
    uid
  );
  let searchParams = {};
  const mnemonics = getObjects(checkedItems);
  const mnemonicsFormatted = JSON.stringify(mnemonics);

  searchParams = createSearchParams({ logs: mnemonicsFormatted });

  // console.log(path)
  navigate(
    { pathname: path, search: searchParams.toString() }
    //,{
    //   state: {
    //     mnemonics: JSON.stringify(mnemonics)
    //    }
    //  }
  );
};

function getObjects(objectOnWelbore: ObjectOnWellbore[]) {
  return objectOnWelbore.map((row) => row.uid);
}
