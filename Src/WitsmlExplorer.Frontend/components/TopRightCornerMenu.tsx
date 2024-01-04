import { Button } from "@equinor/eds-core-react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import OperationContext from "../contexts/operationContext";
import OperationType from "../contexts/operationType";
import useDocumentDimensions from "../hooks/useDocumentDimensions";
import AuthorizationService from "../services/authorizationService";
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
    navigationState: { selectedServer },
    dispatchNavigation
  } = useContext(NavigationContext);
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const { width: documentWidth } = useDocumentDimensions();
  const showLabels = documentWidth > 1180;

  const openSettingsMenu = () => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <SettingsModal />
    });
  };
  const { authorizationState } = useAuthorizationState();

  const openCredentialsModal = () => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server: selectedServer,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(
          selectedServer,
          username,
          dispatchNavigation
        );
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  const openQueryView = () => {
    dispatchNavigation({ type: NavigationType.SelectQueryView, payload: {} });
  };

  return (
    <Layout>
      {selectedServer?.currentUsername && (
        <StyledButton
          colors={colors}
          variant={showLabels ? "ghost" : "ghost_icon"}
          onClick={openCredentialsModal}
        >
          <Icon name="person" />
          {showLabels && selectedServer.currentUsername}
        </StyledButton>
      )}
      <Link to="/">
        <ServerManagerButton showLabels={showLabels} />
      </Link>
      <Link
        to={`servers/${encodeURIComponent(
          authorizationState?.server?.url
        )}/jobs`}
      >
        <JobsButton showLabels={showLabels} />
      </Link>
      <Link
        to={`servers/${encodeURIComponent(
          authorizationState?.server?.url
        )}/query`}
      >
        <StyledButton
          colors={colors}
          variant={showLabels ? "ghost" : "ghost_icon"}
          onClick={openQueryView}
          disabled={!selectedServer}
        >
          <Icon name="code" />
          {showLabels && "Query"}
        </StyledButton>
      </Link>
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
