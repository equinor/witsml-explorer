import { TextField } from "@equinor/eds-core-react";
import OperationType from "contexts/operationType";
import ObjectOnWellbore, {
  toObjectReferences
} from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { ModalContentLayout } from "../StyledComponents/ModalContentLayout";
import AuthorizationService from "services/authorizationService";
import { ChangeEvent, useState } from "react";
import { useOperationState } from "../../hooks/useOperationState";
import { validText } from "./ModalParts";
import ModalDialog from "./ModalDialog";
import { CopyObjectsJob } from "../../models/jobs/copyJobs";
import JobService, { JobType } from "../../services/jobService";
import { v4 as uuid } from "uuid";
import { onClickPaste } from "../ContextMenus/CopyUtils";
import { Server } from "../../models/server";

export interface DuplicateObjectModalProps {
  servers: Server[];
  objectsOnWellbore: ObjectOnWellbore[];
  objectType: ObjectType;
}

const DuplicateObjectModal = (
  props: DuplicateObjectModalProps
): React.ReactElement => {
  const duplicateNameSuffix = "_copy";
  const maxLogNameLength = 64;

  const { servers, objectsOnWellbore, objectType } = props;
  const { dispatchOperation } = useOperationState();

  const toDuplicateTypeName = objectType.toString();
  const [duplicateName, setDuplicateName] = useState<string>(
    objectsOnWellbore[0].name.slice(
      0,
      maxLogNameLength - duplicateNameSuffix.length
    ) + duplicateNameSuffix
  );

  const wellbore = objectsOnWellbore[0].wellboreName;

  const onConfirm = async () => {
    dispatchOperation({ type: OperationType.HideModal });

    const orderCopyJob = () => {
      const copyJob: CopyObjectsJob = {
        source: toObjectReferences(objectsOnWellbore, props.objectType),
        target: {
          wellUid: objectsOnWellbore[0].wellUid,
          wellboreUid: objectsOnWellbore[0].wellboreUid,
          wellName: objectsOnWellbore[0].wellName,
          wellboreName: objectsOnWellbore[0].wellboreName
        },
        targetObjectUid: uuid(),
        targetObjectName: duplicateName
      };
      JobService.orderJob(JobType.CopyObjects, copyJob);
    };
    onClickPaste(
      servers,
      AuthorizationService.selectedServer?.url,
      orderCopyJob
    );
  };

  return (
    <ModalDialog
      heading={`Duplicate ${toDuplicateTypeName}?`}
      confirmText={`Duplicate`}
      confirmDisabled={!validText(duplicateName, 1, 64)}
      onSubmit={onConfirm}
      switchButtonPlaces={true}
      isLoading={false}
      content={
        <ModalContentLayout>
          <TextField
            readOnly
            id="server"
            label="Server"
            defaultValue={AuthorizationService.selectedServer?.name}
            tabIndex={-1}
          />
          <TextField
            readOnly
            id="wellbore"
            label="Wellbore"
            defaultValue={wellbore}
            tabIndex={-1}
          />

          <TextField
            id={"logName"}
            label={"Log Name"}
            required
            value={duplicateName}
            variant={validText(duplicateName) ? undefined : "error"}
            helperText={
              !validText(duplicateName, 1, 64)
                ? "The name must be 1-64 characters"
                : ""
            }
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDuplicateName(e.target.value)
            }
          />
        </ModalContentLayout>
      }
    />
  );
};

export default DuplicateObjectModal;
