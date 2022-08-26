import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { DisplayModalAction, HideContextMenuAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import JobInfo from "../../models/jobs/jobInfo";
import { colors } from "../../styles/Colors";
import JobInfoPropertiesModal from "../Modals/JobInfoPropertiesModal";
import ContextMenu from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";

export interface JobInfoContextMenuProps {
  dispatchOperation: (action: DisplayModalAction | HideContextMenuAction) => void;
  jobInfo: JobInfo;
}

const JobInfoContextMenu = (props: JobInfoContextMenuProps): React.ReactElement => {
  const { dispatchOperation, jobInfo } = props;

  const onClickProperties = async () => {
    const jobInfoPropertiesModalProps = { jobInfo };
    dispatchOperation({ type: OperationType.DisplayModal, payload: <JobInfoPropertiesModal {...jobInfoPropertiesModalProps} /> });
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"properties"} onClick={onClickProperties}>
          <StyledIcon name="settings" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Properties</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default JobInfoContextMenu;
