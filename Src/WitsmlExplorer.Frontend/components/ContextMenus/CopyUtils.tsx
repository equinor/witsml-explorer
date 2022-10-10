import OperationType from "../../contexts/operationType";
import CopyObjectsJob from "../../models/jobs/copyObjectsJob";
import ObjectReferences from "../../models/jobs/objectReferences";
import WellboreReference from "../../models/jobs/wellboreReference";
import ObjectOnWellbore, { toObjectReferences } from "../../models/objectOnWellbore";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import CredentialsService from "../../services/credentialsService";
import JobService, { JobType } from "../../services/jobService";
import { DispatchOperation, showCredentialsModal } from "./ContextMenuUtils";

export const onClickPaste = async (servers: Server[], serverUrl: string, dispatchOperation: DispatchOperation, orderCopyJob: () => void) => {
  const sourceServer = servers.find((server) => server.url === serverUrl);
  if (sourceServer !== null) {
    CredentialsService.setSourceServer(sourceServer);
    const isAuthorized = CredentialsService.isAuthorizedForServer(sourceServer);
    if (!isAuthorized) {
      const message = `You are trying to paste an object from a server that you are not logged in to. Please provide username and password for ${sourceServer.name}.`;
      showCredentialsModal(sourceServer, dispatchOperation, () => orderCopyJob(), message);
    } else {
      orderCopyJob();
    }
  }
};

export const pasteObjectOnWellbore = async (servers: Server[], objectReferences: ObjectReferences, dispatchOperation: DispatchOperation, wellbore: Wellbore, jobType: JobType) => {
  const orderCopyJob = () => {
    const wellboreReference: WellboreReference = {
      wellUid: wellbore.wellUid,
      wellboreUid: wellbore.uid
    };
    const copyJob: CopyObjectsJob = { source: objectReferences, target: wellboreReference };
    JobService.orderJob(jobType, copyJob);
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  onClickPaste(servers, objectReferences?.serverUrl, dispatchOperation, orderCopyJob);
};

export const copyObjectOnWellbore = async (selectedServer: Server, objectsOnWellbore: ObjectOnWellbore[], dispatchOperation: DispatchOperation, objectType: ObjectType) => {
  const objectReferences: ObjectReferences = toObjectReferences(objectsOnWellbore, objectType, selectedServer.url);
  await navigator.clipboard.writeText(JSON.stringify(objectReferences));
  dispatchOperation({ type: OperationType.HideContextMenu });
};
