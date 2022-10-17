import { CircularProgress, Typography } from "@equinor/eds-core-react";
import styled from "styled-components";

const WellProgress = (): React.ReactElement => {
  return (
    <ProgressLayout>
      <InnerProgressLayout>
        <CircularProgress style={{ margin: "auto" }} />
        <Typography style={{ margin: "auto", paddingTop: "10px" }}>Fetching wells. This may take some time.</Typography>
      </InnerProgressLayout>
    </ProgressLayout>
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
