import { Button } from "@equinor/eds-core-react";
import JobsButton from "components/JobsButton";
import { SettingsModal } from "components/Modals/SettingsModal";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "components/Modals/UserCredentialsModal";
import ServerManagerButton from "components/ServerManagerButton";
import { useConnectedServer } from "contexts/connectedServerContext";
import { useLoggedInUsernames } from "contexts/loggedInUsernamesContext";
import { LoggedInUsernamesActionType } from "contexts/loggedInUsernamesReducer";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import useDocumentDimensions from "hooks/useDocumentDimensions";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getQueryViewPath } from "routes/utils/pathBuilder";
import AuthorizationService from "services/authorizationService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
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
  const { dispatchLoggedInUsernames } = useLoggedInUsernames();

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

  const openQueryView = () => {
    navigate(getQueryViewPath(connectedServer?.url));
  };

  const isConnected = !!connectedServer;
  return (
    <Layout>
      {isConnected && (
        <StyledButton
          colors={colors}
          variant={showLabels ? "ghost" : "ghost_icon"}
          onClick={openCredentialsModal}
        >
          <Icon name="person" />
          {showLabels && connectedServer?.currentUsername}
        </StyledButton>
      )}
      <ServerManagerButton showLabels={showLabels} />
      <JobsButton showLabels={showLabels} />
      <StyledButton
        colors={colors}
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openQueryView}
        disabled={!isConnected}
      >
        <Icon name="code" />
        {showLabels && "Query"}
      </StyledButton>
      <StyledButton
        colors={colors}
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openSettingsMenu}
      >
        <Icon name="settings" />
        {showLabels && "Settings"}
      </StyledButton>
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

const StyledButton = styled(Button)<{ colors: Colors }>`
  color: ${(props) => props.colors.infographic.primaryMossGreen};
  white-space: nowrap;
`;
