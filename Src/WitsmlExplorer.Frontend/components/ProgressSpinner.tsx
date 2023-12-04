import { CircularProgress, Typography } from "@equinor/eds-core-react";
import React from "react";
import styled from "styled-components";

type Props = {
  message?: string;
};

const ProgressSpinner = ({ message }: Props): React.ReactElement => {
  return (
    <ProgressLayout>
      <InnerProgressLayout>
        <CircularProgress style={{ margin: "auto" }} />
        {message && (
          <Typography style={{ margin: "auto", paddingTop: "10px" }}>
            {message}
          </Typography>
        )}
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

export default ProgressSpinner;
