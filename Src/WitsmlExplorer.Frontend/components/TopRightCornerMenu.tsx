import { Button } from "@equinor/eds-core-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import OperationContext from "../contexts/operationContext";
import OperationType from "../contexts/operationType";
import useDocumentDimensions from "../hooks/useDocumentDimensions";
import AuthorizationService, {
  AuthorizationStatus
} from "../services/authorizationService";
import { Colors } from "../styles/Colors";
import Icon from "../styles/Icons";
import JobsButton from "./JobsButton";
import { SettingsModal } from "./Modals/SettingsModal";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "./Modals/UserCredentialsModal";
import ServerManagerButton from "./ServerManagerButton";

export default function TopRightCornerMenu() {
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const { width: documentWidth } = useDocumentDimensions();
  const showLabels = documentWidth > 1180;
  const { authorizationState } = useAuthorizationState();
  const navigate = useNavigate();

  const openSettingsMenu = () => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <SettingsModal />
    });
  };

  const openCredentialsModal = () => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: authorizationState?.server,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(authorizationState?.server, username);
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  const openQueryView = () => {
    navigate(
      `servers/${encodeURIComponent(authorizationState?.server?.url)}/query`
    );
  };

  return (
    <Layout>
      {authorizationState?.status === AuthorizationStatus.Authorized && (
        <StyledButton
          colors={colors}
          variant={showLabels ? "ghost" : "ghost_icon"}
          onClick={openCredentialsModal}
        >
          <Icon name="person" />
          {showLabels && authorizationState?.server?.currentUsername}
        </StyledButton>
      )}
      <ServerManagerButton showLabels={showLabels} />
      <JobsButton showLabels={showLabels} />
      <StyledButton
        colors={colors}
        variant={showLabels ? "ghost" : "ghost_icon"}
        onClick={openQueryView}
        disabled={authorizationState?.status !== AuthorizationStatus.Authorized}
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
