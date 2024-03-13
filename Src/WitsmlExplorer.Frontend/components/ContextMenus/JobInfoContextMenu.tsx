import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import JobInfoPropertiesModal from "components/Modals/JobInfoPropertiesModal";
import {
  DisplayModalAction,
  HideContextMenuAction
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import JobInfo from "models/jobs/jobInfo";
import React, { Dispatch, SetStateAction } from "react";
import JobService from "services/jobService";
import { colors } from "styles/Colors";

export interface JobInfoContextMenuProps {
  dispatchOperation: (
    action: DisplayModalAction | HideContextMenuAction
  ) => void;
  jobInfo: JobInfo;
  setShouldRefresh: Dispatch<SetStateAction<boolean>>;
}

const JobInfoContextMenu = (
  props: JobInfoContextMenuProps
): React.ReactElement => {
  const { dispatchOperation, jobInfo, setShouldRefresh } = props;

  const onClickProperties = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const jobInfoPropertiesModalProps = { jobInfo };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <JobInfoPropertiesModal {...jobInfoPropertiesModalProps} />
    });
  };

  const onClickCancelAction = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const abortController = new AbortController();
    JobService.cancelJob(jobInfo.id, abortController.signal);
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"refresh"}
          onClick={() => {
            setShouldRefresh(true);
            dispatchOperation({ type: OperationType.HideContextMenu });
          }}
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Refresh</Typography>
        </MenuItem>,
        <MenuItem
          key={"cancelaction"}
          disabled={jobInfo.cancelable === null || jobInfo.status !== "Started"}
          onClick={onClickCancelAction}
        >
          <StyledIcon name="clear" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>Cancel job</Typography>
        </MenuItem>,
        <Divider key={"divider"} />,
        <MenuItem key={"properties"} onClick={onClickProperties}>
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

export default JobInfoContextMenu;
