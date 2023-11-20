import { Typography } from "@equinor/eds-core-react";
import {  MenuItem } from "@material-ui/core";
import React from "react";
import { v4 as uuid } from "uuid";
import { NavigationState } from "../../contexts/navigationContext";
import { DispatchOperation } from "../../contexts/operationStateReducer";
import { OpenInQueryView } from "../../hooks/useOpenInQueryView";
import LogObject from "../../models/logObject";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { colors } from "../../styles/Colors";
import { ObjectTypeToTemplateObject, StoreFunction } from "../ContentViews/QueryViewUtils";
import { StyledIcon, onClickShowGroupOnServer } from "./ContextMenuUtils";
import NestedMenuItem from "./NestedMenuItem";

export interface ObjectContextMenuProps {
  checkedObjects: ObjectOnWellbore[];
  wellbore: Wellbore;
}

export const ObjectMenuItemsSecondPart = (
  checkedObjects: ObjectOnWellbore[],
  objectType: ObjectType,
  navigationState: NavigationState,
  dispatchOperation: DispatchOperation,
  openInQueryView: OpenInQueryView,
  wellbore: Wellbore
): React.ReactElement[] => {

  const { servers } = navigationState;

  return [   
    <NestedMenuItem key={"showOnServer"} label={"Show on server"} disabled={checkedObjects.length !== 1}>
      {servers.map((server: Server) => (
        <MenuItem key={server.name} onClick={() => onClickShowGroupOnServer(dispatchOperation, server, wellbore, objectType, (checkedObjects[0] as LogObject)?.indexType)}>
          <Typography color={"primary"}>{server.name}</Typography>
        </MenuItem>
      ))}
    </NestedMenuItem>,
    <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
      {[
        <MenuItem
          key={"openInQueryView"}
          disabled={checkedObjects.length != 1}
          onClick={() =>
            openInQueryView({
              templateObject: ObjectTypeToTemplateObject[objectType],
              storeFunction: StoreFunction.GetFromStore,
              wellUid: wellbore.wellUid,
              wellboreUid: wellbore.uid,
              objectUid: checkedObjects[0].uid
            })
          }
        >
          <StyledIcon name="textField" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Open in query view</Typography>
        </MenuItem>,
        <MenuItem
          key={"newObject"}
          disabled={checkedObjects.length != 1}
          onClick={() =>
            openInQueryView({
              templateObject: ObjectTypeToTemplateObject[objectType],
              storeFunction: StoreFunction.AddToStore,
              wellUid: wellbore.wellUid,
              wellboreUid: wellbore.uid,
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
