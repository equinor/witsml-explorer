import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import JobService, { JobType } from "../../services/jobService";
import React from "react";
import Risk from "../../models/riskObject";
import RiskService from "../../services/riskObjectService";
import ModificationType from "../../contexts/modificationType";
import RiskReferences from "../../models/jobs/riskReferences";
import { UpdateWellboreRisksAction } from "../../contexts/navigationStateReducer";
import ConfirmModal from "../Modals/ConfirmModal";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

// export const useClipboardRiskComponentReferences: () => [RiskComponentReferences | null, Dispatch<SetStateAction<RiskComponentReferences>>] = () => {
//   const [riskComponentReferences, setRiskComponentReferences] = useState<RiskComponentReferences>(null);

//   useEffect(() => {
//     const tryToParseClipboardContent = async () => {
//       try {
//         const clipboardText = await navigator.clipboard.readText();
//         const riskComponentReferences = parseStringToRiskComponentReferences(clipboardText);
//         setRiskComponentReferences(riskComponentReferences);
//       } catch (e) {
//         //Not a valid object on the clipboard? That is fine, we won't use it.
//       }
//     };
//     tryToParseClipboardContent();
//   }, []);

//   return [riskComponentReferences, setRiskComponentReferences];
// };

// export const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, risk: Risk, riskComponentReferences: RiskComponentReferences) => {
//   const onConnectionVerified = async (credentials: ServerCredentials) => {
//     await CredentialsService.saveCredentials(credentials);
//     orderCopyJob(risk, riskComponentReferences, dispatchOperation);
//     dispatchOperation({ type: OperationType.HideModal });
//   };

//   const currentCredentials = CredentialsService.getSourceServerCredentials();
//   const userCredentialsModalProps: UserCredentialsModalProps = {
//     server: server,
//     serverCredentials: currentCredentials,
//     mode: CredentialsMode.TEST,
//     errorMessage: `You are trying to paste risk components from a server that you are not logged in to. Please provide username and password for ${server.name}.`,
//     onConnectionVerified,
//     confirmText: "Save"
//   };
//   dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
// };

// export const orderCopyJob = (risk: Risk, riskComponentReferences: RiskComponentReferences, dispatchOperation: DispatchOperation) => {
//   const riskReference: RiskReference = {
//     wellUid: risk.wellUid,
//     wellboreUid: risk.wellboreUid,
//     uid: risk.uid
//   };

//   const copyJob = { source: riskComponentReferences, target: riskReference };
//   JobService.orderJob(JobType.CopyRiskComponents, copyJob);
//   dispatchOperation({ type: OperationType.HideContextMenu });
// };

// export const onClickPaste = async (servers: Server[], dispatchOperation: DispatchOperation, risk: Risk, riskComponentReferences: RiskComponentReferences) => {
//   const sourceServer = servers.find((server) => server.url === riskComponentReferences.serverUrl);
//   if (sourceServer !== null) {
//     CredentialsService.setSourceServer(sourceServer);
//     const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
//     if (!hasPassword) {
//       showCredentialsModal(sourceServer, dispatchOperation, risk, riskComponentReferences);
//     } else {
//       orderCopyJob(risk, riskComponentReferences, dispatchOperation);
//     }
//   }
// };

//Skriv om til risk og fikse import statements
export const deleteRisk = async (risks: Risk[], dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreRisksAction) => void) => {
  dispatchOperation({ type: OperationType.HideModal });
  const job = {
    riskReferences: {
      riskUids: risks.map((risk) => risk.uid),
      wellUid: risks[0].wellUid,
      wellboreUid: risks[0].wellboreUid
    }
  };
  await JobService.orderJob(JobType.DeleteRisks, job);
  const freshRisks = await RiskService.getRisks(job.riskReferences.wellUid, job.riskReferences.wellboreUid);
  dispatchNavigation({
    type: ModificationType.UpdateRiskObjects,
    payload: {
      wellUid: job.riskReferences.wellUid,
      wellboreUid: job.riskReferences.wellboreUid,
      risks: freshRisks
    }
  });
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickCopy = async (selectedServer: Server, risks: Risk[], dispatchOperation: DispatchOperation) => {
  const riskReferences: RiskReferences = {
    riskUids: risks.map((risk) => risk.uid),
    wellUid: risks[0].wellUid,
    wellboreUid: risks[0].wellboreUid
  };
  await navigator.clipboard.writeText(JSON.stringify(riskReferences));
  dispatchOperation({ type: OperationType.HideContextMenu });
};

export const onClickDelete = async (risks: Risk[], dispatchOperation: DispatchOperation, dispatchNavigation: (action: UpdateWellboreRisksAction) => void) => {
  const confirmation = (
    <ConfirmModal
      heading={"Delete risk?"}
      content={
        <span>
          This will permanently delete risks: <strong>{risks.map((item) => item.uid).join(", ")}</strong>
        </span>
      }
      onConfirm={() => deleteRisk(risks, dispatchOperation, dispatchNavigation)}
      confirmColor={"secondary"}
      switchButtonPlaces={true}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
};
