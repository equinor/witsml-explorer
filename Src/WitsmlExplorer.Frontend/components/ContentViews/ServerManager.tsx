import { useIsAuthenticated } from "@azure/msal-react";
import { ButtonProps, Table, Typography } from "@equinor/eds-core-react";
import { useQueryClient } from "@tanstack/react-query";
import ServerModal, {
  showDeleteServerModal
} from "components/Modals/ServerModal";
import UserCredentialsModal, {
  UserCredentialsModalProps
} from "components/Modals/UserCredentialsModal";
import ProgressSpinner from "components/ProgressSpinner";
import { Button } from "components/StyledComponents/Button";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import OperationType from "contexts/operationType";
import { useGetServers } from "hooks/query/useGetServers";
import { Server, emptyServer } from "models/server";
import { adminRole, getUserAppRoles, msalEnabled } from "msal/MsalAuthProvider";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getWellsViewPath } from "routes/utils/pathBuilder";
import AuthorizationService from "services/authorizationService";
import styled from "styled-components";
import { Colors } from "styles/Colors";
import Icon from "styles/Icons";

const NEW_SERVER_ID = "1";

const ServerManager = (): React.ReactElement => {
  const isAuthenticated = !msalEnabled || useIsAuthenticated();
  const queryClient = useQueryClient();
  const { servers, isFetching } = useGetServers({ enabled: isAuthenticated });
  const {
    operationState: { colors },
    dispatchOperation
  } = useContext(OperationContext);
  const editDisabled = msalEnabled && !getUserAppRoles().includes(adminRole);
  const navigate = useNavigate();
  const { connectedServer, setConnectedServer } = useConnectedServer();

  const connectServer = async (server: Server) => {
    const userCredentialsModalProps: UserCredentialsModalProps = {
      server,
      onConnectionVerified: (username) => {
        dispatchOperation({ type: OperationType.HideModal });
        AuthorizationService.onAuthorized(server, username);
        AuthorizationService.setSelectedServer(server);
        setConnectedServer(server);
        navigate(getWellsViewPath(server.url));
      }
    };
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <UserCredentialsModal {...userCredentialsModalProps} />
    });
  };

  const disconnectServer = () => {
    AuthorizationService.setSelectedServer(null);
    setConnectedServer(null);
  };

  const onEditItem = (server: Server) => {
    dispatchOperation({
      type: OperationType.DisplayModal,
      payload: <ServerModal editDisabled={editDisabled} server={server} />
    });
  };

  const CellStyle = {
    color: colors.interactive.primaryResting,
    padding: "0.3rem",
    borderBottom: `2px solid ${colors.interactive.disabledBorder}`
  };
  const CellHeaderStyle = {
    ...CellStyle,
    background: colors.ui.backgroundLight
  };
  const CloudIconStyle = {
    textlign: "center",
    borderBottom: `2px solid ${colors.interactive.disabledBorder}`
  };

  const isConnected = (server: Server): boolean => {
    return server.id === connectedServer?.id;
  };

  if (isFetching) {
    return <ProgressSpinner message="Fetching servers." />;
  }

  return (
    <>
      <Header>
        <Typography
          style={{ color: colors.infographic.primaryMossGreen }}
          bold={true}
        >
          Manage Connections
        </Typography>
        <Button
          variant="outlined"
          value={NEW_SERVER_ID}
          key={NEW_SERVER_ID}
          disabled={editDisabled}
          onClick={() => onEditItem(emptyServer())}
        >
          <Icon name="cloudDownload" />
          New server
        </Button>
      </Header>
      <Table style={{ width: "100%" }} className="serversList">
        <Table.Head>
          <Table.Row>
            <Table.Cell style={CellHeaderStyle}>Server Name</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Server</Table.Cell>
            <Table.Cell style={CellHeaderStyle}>Username</Table.Cell>
            <Table.Cell style={CellHeaderStyle} />
            <Table.Cell style={CellHeaderStyle}>Status</Table.Cell>
            <Table.Cell style={CellHeaderStyle}></Table.Cell>
            <Table.Cell style={CellHeaderStyle}></Table.Cell>
          </Table.Row>
        </Table.Head>
        <StyledTableBody colors={colors}>
          {servers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((server: Server) => (
              <Table.Row id={server.id} key={server.id}>
                <Table.Cell style={CellStyle}>
                  {isConnected(server) ? (
                    <StyledLink
                      onClick={() => navigate(getWellsViewPath(server.url))}
                    >
                      {server.name}
                    </StyledLink>
                  ) : (
                    server.name
                  )}
                </Table.Cell>
                <Table.Cell style={CellStyle}>{server.url}</Table.Cell>
                <Table.Cell style={CellStyle}>
                  {server.currentUsername == null ? "" : server.currentUsername}
                </Table.Cell>
                <Table.Cell style={CloudIconStyle}>
                  <Icon
                    color={
                      isConnected(server)
                        ? colors.interactive.successResting
                        : colors.text.staticIconsTertiary
                    }
                    name="cloudDownload"
                  />
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <ConnectButton
                    colors={colors}
                    isConnected={isConnected(server)}
                    onClick={
                      isConnected(server)
                        ? () => disconnectServer()
                        : () => connectServer(server)
                    }
                  />
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <Button variant="ghost" onClick={() => onEditItem(server)}>
                    <Icon
                      name="edit"
                      size={24}
                      color={colors.text.staticIconsTertiary}
                    />
                  </Button>
                </Table.Cell>
                <Table.Cell style={CellStyle}>
                  <Button
                    disabled={editDisabled}
                    variant="ghost"
                    onClick={() =>
                      showDeleteServerModal(
                        server,
                        dispatchOperation,
                        connectedServer,
                        setConnectedServer,
                        queryClient
                      )
                    }
                  >
                    <Icon
                      name="deleteToTrash"
                      size={24}
                      color={colors.text.staticIconsTertiary}
                    />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
        </StyledTableBody>
      </Table>
    </>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.9rem;
  align-items: center;
`;

interface ConnectButtonProps extends ButtonProps {
  isConnected: boolean;
  colors: Colors;
}

const ConnectButton = ({ isConnected, ...props }: ConnectButtonProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const {
    operationState: { colors }
  } = useContext(OperationContext);

  return (
    <StyledConnectButton
      colors={colors}
      {...props}
      variant="outlined"
      isConnected={isConnected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isConnected ? (isHovered ? "Disconnect" : "Connected") : "Connect"}
    </StyledConnectButton>
  );
};

const StyledConnectButton = styled(Button)<{
  isConnected: boolean;
  colors: Colors;
}>`
  border-radius: 20px;
  width: 5.75rem;
  height: 1.5rem;
  ${(props) =>
    props.isConnected
      ? `
    color: ${props.colors.interactive.primaryResting};
    border-color: ${props.colors.interactive.successResting};
    &:hover {
      color: ${props.colors.interactive.dangerHover};
      border-color: ${props.colors.interactive.dangerHover};
      background-color: transparent;
    }
  `
      : `
    color: ${props.colors.text.staticIconsDefault};
  `}
  &:hover {
    border-radius: 20px;
  }
`;

const StyledTableBody = styled(Table.Body)<{ colors: Colors }>`
  tr:nth-child(even) {
    background-color: ${(props) => props.colors.ui.backgroundLight};
  }

  tr:nth-child(odd) {
    background-color: ${(props) => props.colors.ui.backgroundDefault};
  }
`;

const StyledLink = styled.a`
  cursor: pointer;
  text-decoration: underline;
  &&:hover {
    text-decoration: none;
  }
`;

export default ServerManager;
