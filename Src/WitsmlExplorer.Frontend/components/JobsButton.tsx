import { Button } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import NavigationContext from "../contexts/navigationContext";
import NavigationType from "../contexts/navigationType";
import Icon from "../styles/Icons";

export interface JobsButtonProps {
  showLabels: boolean;
}

const JobsButton = (props: JobsButtonProps): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { selectedServer } = navigationState;
  const { dispatchNavigation } = useContext(NavigationContext);

  const onClick = () => {
    dispatchNavigation({ type: NavigationType.SelectJobs, payload: {} });
  };

  return (
    <Button variant={props.showLabels ? "ghost" : "ghost_icon"} onClick={onClick} disabled={!selectedServer}>
      <Icon name="assignment" />
      {props.showLabels && "Jobs"}
    </Button>
  );
};

export default JobsButton;
