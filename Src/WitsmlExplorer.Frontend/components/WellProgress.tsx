import { CircularProgress, Typography } from "@equinor/eds-core-react";
import React, { useContext } from "react";
import styled from "styled-components";
import NavigationContext from "../contexts/navigationContext";
import CredentialsService from "../services/credentialsService";

type Props = {
  children: JSX.Element;
};
const WellProgress = ({ children }: Props): React.ReactElement => {
  const { navigationState } = useContext(NavigationContext);
  const { wells, selectedServer } = navigationState;
  const showIndicator = wells?.length == 0 && selectedServer != null && CredentialsService.isAuthorizedForServer(selectedServer);
  return showIndicator ? (
    <ProgressLayout>
      <InnerProgressLayout>
        <CircularProgress style={{ margin: "auto" }} />
        <Typography style={{ margin: "auto", paddingTop: "10px" }}>Fetching wells. This may take some time.</Typography>
      </InnerProgressLayout>
    </ProgressLayout>
  ) : (
    children
  );
};

const ProgressLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const InnerProgressLayout = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
`;

export default WellProgress;
