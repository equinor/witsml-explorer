import { CircularProgress, Typography } from "@equinor/eds-core-react";
import OperationContext from "contexts/operationContext";
import React, { useContext } from "react";
import styled from "styled-components";
import { Colors, dark } from "styles/Colors";

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

export const ProgressSpinnerOverlay = ({
  message
}: Props): React.ReactElement => {
  const {
    operationState: { colors }
  } = useContext(OperationContext);
  return (
    <Overlay colors={colors}>
      <InnerOverlay colors={colors}>
        <ProgressSpinner message={message} />
      </InnerOverlay>
    </Overlay>
  );
};

const Overlay = styled.div<{ colors: Colors }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${(props) =>
    props.colors === dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InnerOverlay = styled.div<{ colors: Colors }>`
  background-color: ${(props) => props.colors.ui.backgroundDefault};
  color: ${(props) => props.colors.text.staticIconsDefault};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px;
  box-shadow: 1px 4px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
`;

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
