import { Server } from "../../models/server";
import CredentialsService from "../../services/credentialsService";
import { DispatchOperation, showCredentialsModal } from "./ContextMenuUtils";

export const onClickPaste = async (servers: Server[], serverUrl: string, dispatchOperation: DispatchOperation, orderCopyJob: () => void) => {
  const sourceServer = servers.find((server) => server.url === serverUrl);
  if (sourceServer !== null) {
    CredentialsService.setSourceServer(sourceServer);
    const hasPassword = CredentialsService.hasPasswordForServer(sourceServer);
    if (!hasPassword) {
      const message = `You are trying to paste an object from a server that you are not logged in to. Please provide username and password for ${sourceServer.name}.`;
      showCredentialsModal(sourceServer, dispatchOperation, () => orderCopyJob(), message);
    } else {
      orderCopyJob();
    }
  }
};
