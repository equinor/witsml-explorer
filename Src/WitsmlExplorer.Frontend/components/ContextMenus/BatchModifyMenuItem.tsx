import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { getBatchModifyObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/BatchModifyObjectOnWellboreProperties";
import { PropertiesModal } from "components/Modals/PropertiesModal/PropertiesModal";
import { useOperationState } from "hooks/useOperationState";
import { ReactElement, forwardRef } from "react";
import OperationType from "../../contexts/operationType";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType, ObjectTypeToModel } from "../../models/objectType";
import JobService, { JobType } from "../../services/jobService";
import { colors } from "../../styles/Colors";
import { ReportModal } from "../Modals/ReportModal";
import { StyledIcon, menuItemText } from "./ContextMenuUtils";

export interface BatchModifyMenuItemProps {
  checkedObjects: ObjectOnWellbore[];
  objectType: ObjectType;
}

export const BatchModifyMenuItem = forwardRef(
  (props: BatchModifyMenuItemProps, ref: React.Ref<any>): ReactElement => {
    const { checkedObjects, objectType } = props;
    const { dispatchOperation } = useOperationState();
    const batchModifyProperties =
      getBatchModifyObjectOnWellboreProperties(objectType);

    const onSubmitBatchModify = async (batchUpdates: {
      [key: string]: string;
    }) => {
      dispatchOperation({ type: OperationType.HideModal });
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
        object: {} as ObjectTypeToModel[typeof objectType],
        properties: batchModifyProperties,
        onSubmit: onSubmitBatchModify
      };
      dispatchOperation({
        type: OperationType.DisplayModal,
        payload: <PropertiesModal {...batchModifyModalProps} />
      });
    };

    return (
      <MenuItem
        key="batchModify"
        onClick={onClickBatchModify}
        disabled={checkedObjects.length < 2}
        ref={ref}
      >
        <StyledIcon name="edit" color={colors.interactive.primaryResting} />
        <Typography color={"primary"}>
          {menuItemText("Batch update", objectType, checkedObjects)}
        </Typography>
      </MenuItem>
    );
  }
);

BatchModifyMenuItem.displayName = "BatchModifyMenuItem";
