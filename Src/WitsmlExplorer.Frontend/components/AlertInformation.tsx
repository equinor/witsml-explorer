import React from "react";
import { Tooltip, Typography } from "@equinor/eds-core-react";
import styled from "styled-components";
import { useOperationState } from "hooks/useOperationState";

type AlertInformationProps = {
  message?: string;
  details?: string;
};

const AlertInformation = (props: AlertInformationProps): React.ReactElement => {
  const { message, details } = props;
  const {
    operationState: { colors }
  } = useOperationState();
  return (
    <>
      <InfoContainer>
        <Tooltip title={details}>
          <Typography
            bold
            color="primary"
            style={{
              color: colors.infographic.primaryMossGreen
            }}
          >
            What is new? {message}
          </Typography>
        </Tooltip>
      </InfoContainer>
    </>
  );
};

const InfoContainer = styled.div`
   {
    padding: 2px;
    align-items: center;
  }
`;

export default AlertInformation;
