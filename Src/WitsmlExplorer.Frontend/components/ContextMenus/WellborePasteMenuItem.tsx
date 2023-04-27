import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";
import { pasteObjectOnWellbore } from "./CopyUtils";
import NestedMenuItem from "./NestedMenuItem";
import { useClipboardReferences } from "./UseClipboardReferences";

const items = [
  { type: ObjectType.BhaRun },
  { type: ObjectType.FormationMarker },
  { type: ObjectType.Log, jobType: JobType.CopyLog },
  { type: ObjectType.Message },
  { type: ObjectType.MudLog },
  { type: ObjectType.Rig },
  { type: ObjectType.Risk },
  { type: ObjectType.Trajectory },
  { type: ObjectType.Tubular },
  { type: ObjectType.WbGeometry }
];

export interface WellborePasteMenuItemProps {
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction | HideModalAction) => void;
  wellbore: Wellbore;
  servers?: Server[];
}

const WellborePasteMenuItem = (props: WellborePasteMenuItemProps): React.ReactElement => {
  const { dispatchOperation, wellbore, servers } = props;
  const objectReferences = useClipboardReferences();

  return (
    <NestedMenuItem key={"paste"} label={"Paste"} icon="paste">
      {items.map((item) => (
        <MenuItem
          key={"paste" + item.type}
          onClick={() => pasteObjectOnWellbore(servers, objectReferences, dispatchOperation, wellbore, item.jobType ?? JobType.CopyObjects)}
          disabled={objectReferences === null || objectReferences.objectType != item.type}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>{menuItemText("paste", item.type, objectReferences?.objectUids)}</Typography>
        </MenuItem>
      ))}
    </NestedMenuItem>
  );
};

export default WellborePasteMenuItem;
