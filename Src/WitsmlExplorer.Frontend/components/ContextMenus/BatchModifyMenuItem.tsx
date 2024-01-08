import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import OperationContext from "contexts/operationContext";
import { ReactElement, useContext } from "react";
import OperationType from "../../contexts/operationType";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import {
  BatchModifyPropertiesModal,
  BatchModifyProperty
} from "../Modals/BatchModifyPropertiesModal";
import { validText } from "../Modals/ModalParts";
import { ReportModal } from "../Modals/ReportModal";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";

export interface BatchModifyMenuItemProps {
  checkedObjects: ObjectOnWellbore[];
  objectType: ObjectType;
}

export const BatchModifyMenuItem = (
  props: BatchModifyMenuItemProps
): ReactElement => {
  const { checkedObjects, objectType } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const batchModifyProperties = objectBatchModifyProperties[objectType];

  const onSubmitBatchModify = async (batchUpdates: {
    [key: string]: string;
  }) => {
    const objectsToModify = checkedObjects.map((object) => ({
      uid: object.uid,
      wellboreUid: object.wellboreUid,
      wellUid: object.wellUid,
      name: object.name,
      ...batchUpdates,
      objectType
    }));
    const modifyJob = {
      objects: objectsToModify,
      objectType
    };
    const jobId = await JobService.orderJob(
      JobType.BatchModifyObjectsOnWellbore,
      modifyJob
    );
    if (jobId) {
      const reportModalProps = { jobId };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <ReportModal {...reportModalProps} />
      });
    }
  };

  const onClickBatchModify = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
    const batchModifyModalProps = {
      title: menuItemText("Batch update", objectType, checkedObjects),
      properties: batchModifyProperties,
      onSubmit: onSubmitBatchModify
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <BatchModifyPropertiesModal {...batchModifyModalProps} />
    });
  };

  return (
    <MenuItem
      key="batchModify"
      onClick={onClickBatchModify}
      disabled={checkedObjects.length < 2}
    >
      <StyledIcon name="edit" color={colors.interactive.primaryResting} />
      <Typography color={"primary"}>
        {menuItemText("Batch update", objectType, checkedObjects)}
      </Typography>
    </MenuItem>
  );
};

// Note: Only add properties that can be updated directly (without having to create a new object and delete the old one)
export const objectBatchModifyProperties: {
  [key in ObjectType]?: BatchModifyProperty[];
} = {
  [ObjectType.BhaRun]: [],
  [ObjectType.ChangeLog]: [],
  [ObjectType.FluidsReport]: [],
  [ObjectType.FormationMarker]: [],
  [ObjectType.Log]: [
    {
      property: "name",
      validator: (value: string) => validText(value, 0, 64),
      helperText: "Name must be less than 64 characters"
    },
    {
      property: "runNumber",
      validator: (value: string) => validText(value, 0, 16),
      helperText: "Run number must be less than 16 characters"
    },
    {
      property: "commonData.comments"
    }
  ],
  [ObjectType.Message]: [],
  [ObjectType.MudLog]: [],
  [ObjectType.Rig]: [],
  [ObjectType.Risk]: [],
  [ObjectType.Trajectory]: [],
  [ObjectType.Tubular]: [],
  [ObjectType.WbGeometry]: []
};
