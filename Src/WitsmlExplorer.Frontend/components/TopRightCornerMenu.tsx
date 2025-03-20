import { SettingsModal } from "components/Modals/SettingsModal";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "components/Modals/UserCredentialsModal";
import { Button } from "components/StyledComponents/Button";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useLoggedInUsernames } from "contexts/loggedInUsernamesContext";
import { LoggedInUsernamesActionType } from "contexts/loggedInUsernamesReducer";
import OperationType from "contexts/operationType";
import useDocumentDimensions from "hooks/useDocumentDimensions";
import { useOperationState } from "hooks/useOperationState";
import { useNavigate } from "react-router-dom";
import { getJobsViewPath, getQueryViewPath } from "routes/utils/pathBuilder";
import AuthorizationService from "services/authorizationService";
import styled from "styled-components";
import Icon from "styles/Icons";
import WellboreUidMappingOverviewModal from "./Modals/WellboreUidMappingOverviewModal.tsx";

export default function TopRightCornerMenu() {
  const { dispatchOperation } = useOperationState();
  const { width: documentWidth } = useDocumentDimensions();
  const showLabels = documentWidth > 1180;
  const { connectedServer } = useConnectedServer();
  const navigate = useNavigate();
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();

  const openSettingsMenu = () => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <SettingsModal />
    });
  };

  const openUidModal = () => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <WellboreUidMappingOverviewModal />
    });
  };

  const openCredentialsModal = () => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: connectedServer,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(connectedServer, username);
        dispatchLoggedInUsernames({
          type: LoggedInUsernamesActionType.AddLoggedInUsername,
          payload: { serverId: connectedServer.id, username }
        });
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  const openServerManagerView = () => {
    navigate("/");
  };

  const openJobsView = () => {
    navigate(getJobsViewPath(connectedServer?.url));
  };

  const openQueryView = () => {
    navigate(getQueryViewPath(connectedServer?.url));
  };

  const isConnected = !!connectedServer;
  return (
    <Layout>
      {isConnected && (
        <Button
          variant={showLabels ? "ghost" : "ghost_icon"}
          onClick={openCredentialsModal}
        >
          <Icon name="person" />
          {showLabels && connectedServer?.currentUsername}
        </Button>
      )}
      <Button
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openServerManagerView}
        disabled={!isConnected}
      >
        <Icon name={isConnected ? "cloudDownload" : "cloudOff"} />
        {showLabels && (isConnected ? "Server Connections" : "No Connection")}
      </Button>
      <Button
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openJobsView}
        disabled={!connectedServer}
      >
        <Icon name="assignment" />
        {showLabels && "Jobs"}
      </Button>
      <Button
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openQueryView}
        disabled={!isConnected}
      >
        <Icon name="code" />
        {showLabels && "Query"}
      </Button>
      <Button
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openUidModal}
      >
        <Icon name="link" />
        {showLabels && "UID Mapping"}
      </Button>
      <Button
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openSettingsMenu}
      >
        <Icon name="settings" />
        {showLabels && "Settings"}
      </Button>
    </Layout>
  );
}

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-right: 1rem;
`;
