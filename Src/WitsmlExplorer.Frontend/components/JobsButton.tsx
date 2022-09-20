import { Button } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import { msalEnabled } from "../msal/MsalAuthProvider";
import CredentialsService from "../services/credentialsService";
import Icon from "../styles/Icons";

const JobsButton = (): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const { dispatchNavigation } = useContext(NavigationContext);

  const onClick = () => {
    dispatchNavigation({ type: NavigationType.SelectJobs, payload: {} });
  };

  const currentPassword = CredentialsService.getCredentials().find((cred) => cred.server.id == selectedServer?.id)?.password;
  const disabled = !selectedServer || (!msalEnabled && !currentPassword);

  return (
    <Button variant="ghost" onClick={onClick} disabled={disabled}>
      <Icon name="assignment" />
      Jobs
    </Button>
  );
};

export default JobsButton;
