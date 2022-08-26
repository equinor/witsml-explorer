import { Button } from "@material-ui/core";
import React, { useContext } from "react";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import CredentialsService from "../services/credentialsService";

const JobsButton = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const { dispatchNavigation } = useContext(NavigationContext);

  const onClick = () => {
    dispatchNavigation({ type: NavigationType.SelectJobs, payload: {} });
  };

  const currentPassword = CredentialsService.getCredentials().find((cred) => cred.server.id == selectedServer.id)?.password;

  return (
    <Button onClick={onClick} disabled={!selectedServer || !currentPassword}>
      Jobs
    </Button>
  );
};

export default JobsButton;
