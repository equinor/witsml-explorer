import { Divider, Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import JobInfoPropertiesModal from "components/Modals/JobInfoPropertiesModal";
import {
  DisplayModalAction,
  HideContextMenuAction
} from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { refreshJobInfoQuery } from "hooks/query/queryRefreshHelpers";
import JobInfo from "models/jobs/jobInfo";
import React from "react";
import { colors } from "styles/Colors";

export interface JobInfoContextMenuProps {
  dispatchOperation: (
    action: DisplayModalAction | HideContextMenuAction
  ) => void;
  jobInfo: JobInfo;
}

const JobInfoContextMenu = (
  props: JobInfoContextMenuProps
): React.ReactElement => {
  const { dispatchOperation, jobInfo } = props;
  const queryClient = useQueryClient();

  const onClickProperties = async () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const jobInfoPropertiesModalProps = { jobInfo };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <JobInfoPropertiesModal {...jobInfoPropertiesModalProps} />
    });
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"refresh"}
          onClick={() => {
            refreshJobInfoQuery(queryClient);
            dispatchOperation({ type: OperationType.HideContextMenu });
          }}
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>Refresh</Typography>
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
