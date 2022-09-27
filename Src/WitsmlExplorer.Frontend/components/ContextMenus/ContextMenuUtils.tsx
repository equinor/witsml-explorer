import styled from "styled-components";
import { DisplayModalAction, HideContextMenuAction, HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import { Server } from "../../models/server";
import CredentialsService, { BasicServerCredentials } from "../../services/credentialsService";
import Icon from "../../styles/Icons";
import UserCredentialsModal, { CredentialsMode, UserCredentialsModalProps } from "../Modals/UserCredentialsModal";
import { QueryParams } from "../Routing";

export type DispatchOperation = (action: HideModalAction | HideContextMenuAction | DisplayModalAction) => void;

export const StyledIcon = styled(Icon)`
  && {
    margin-right: 5px;
  }
`;

export const menuItemText = (operation: string, object: string, array: any[] | null) => {
  const operationUpperCase = operation.charAt(0).toUpperCase() + operation.slice(1).toLowerCase();
  const objectLowercase = object.toLowerCase();
  const objectPlural = objectLowercase.charAt(object.length - 1) == "y" ? objectLowercase.slice(0, object.length - 1) + "ies" : objectLowercase + "s";
  const isPlural = array ? array.length > 1 : false;
  const count = array?.length > 0 ? ` ${array.length} ` : " ";
  return `${operationUpperCase}${count}${isPlural ? objectPlural : objectLowercase}`;
};

export const showCredentialsModal = (server: Server, dispatchOperation: DispatchOperation, onSuccess: () => void, message: string) => {
  const onConnectionVerified = async (credentials: BasicServerCredentials) => {
    CredentialsService.saveCredentials(credentials);
    onSuccess();
    dispatchOperation({ type: OperationType.HideModal });
  };

  const currentCredentials = CredentialsService.getSourceServerCredentials();
  const userCredentialsModalProps: UserCredentialsModalProps = {
    server: server,
    serverCredentials: currentCredentials,
    mode: CredentialsMode.TEST,
    errorMessage: message,
    onConnectionVerified,
    confirmText: "Save"
  };
  dispatchOperation({ type: OperationType.DisplayModal, payload: <UserCredentialsModal {...userCredentialsModalProps} /> });
};

export const onClickShowOnServer = async (
  dispatchOperation: DispatchOperation,
  server: Server,
  wellUid: string,
  wellboreUid: string,
  uid: string,
  paramName: keyof QueryParams
) => {
  const host = `${window.location.protocol}//${window.location.host}`;
  const logUrl = `${host}/?serverUrl=${server.url}&wellUid=${wellUid}&wellboreUid=${wellboreUid}&${paramName}=${uid}`;
  window.open(logUrl);
  dispatchOperation({ type: OperationType.HideContextMenu });
};
