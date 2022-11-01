import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import { DispatchOperation } from "../ContextMenus/ContextMenuUtils";
import ConfirmModal from "./ConfirmModal";

export function displayMissingWellboreModal(targetServer: Server, wellUid: string, wellboreUid: string, dispatchOperation: DispatchOperation, message = "") {
  const confirmation = (
    <ConfirmModal
      heading={`Wellbore not found`}
      content={
        <span>
          Unable to find wellbore on {targetServer.name}
          <br />
          with well UID {wellUid}
          <br />
          and wellbore UID {wellboreUid}
          <br />
          {message}
        </span>
      }
      onConfirm={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
}

export function displayMissingLogModal(targetServer: Server, wellUid: string, wellboreUid: string, logUid: string, dispatchOperation: DispatchOperation, message = "") {
  const confirmation = (
    <ConfirmModal
      heading={`Log not found`}
      content={
        <span>
          Unable to find log on {targetServer.name}
          <br />
          with well UID {wellUid}
          <br />
          wellbore UID {wellboreUid}
          <br />
          and log UID {logUid}
          <br />
          {message}
        </span>
      }
      onConfirm={() => dispatchOperation({ type: OperationType.HideModal })}
      confirmColor={"primary"}
      confirmText={`OK`}
      showCancelButton={false}
    />
  );
  dispatchOperation({ type: OperationType.DisplayModal, payload: confirmation });
}
