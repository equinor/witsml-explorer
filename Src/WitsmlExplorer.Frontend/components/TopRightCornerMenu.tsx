import JobsButton from "components/JobsButton";
import { SettingsModal } from "components/Modals/SettingsModal";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "components/Modals/UserCredentialsModal";
import ServerManagerButton from "components/ServerManagerButton";
import { StyledGhostButton } from "components/StyledComponents/Buttons";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import useDocumentDimensions from "hooks/useDocumentDimensions";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getQueryViewPath } from "routes/utils/pathBuilder";
import AuthorizationService from "services/authorizationService";
import styled from "styled-components";
import Icon from "styles/Icons";

export default function TopRightCornerMenu() {
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const { width: documentWidth } = useDocumentDimensions();
  const showLabels = documentWidth > 1180;
  const { connectedServer } = useConnectedServer();
  const navigate = useNavigate();

  const openSettingsMenu = () => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <SettingsModal />
    });
  };

  const openCredentialsModal = () => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: connectedServer,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(connectedServer, username);
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  const openQueryView = () => {
    navigate(getQueryViewPath(connectedServer?.url));
  };

  const isConnected = !!connectedServer;
  return (
    <Layout>
      {isConnected && (
        <StyledGhostButton
          colors={colors}
          variant={showLabels ? "ghost" : "ghost_icon"}
          onClick={openCredentialsModal}
        >
          <Icon name="person" />
          {showLabels && connectedServer?.currentUsername}
        </StyledGhostButton>
      )}
      <ServerManagerButton showLabels={showLabels} />
      <JobsButton showLabels={showLabels} />
      <StyledGhostButton
        colors={colors}
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openQueryView}
        disabled={!isConnected}
      >
        <Icon name="code" />
        {showLabels && "Query"}
      </StyledGhostButton>
      <StyledGhostButton
        colors={colors}
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openSettingsMenu}
      >
        <Icon name="settings" />
        {showLabels && "Settings"}
      </StyledGhostButton>
    </Layout>
  );
}

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-right: 1rem;
  width: auto;
`;
