import React from "react";
import styled from "styled-components";
import { colors } from "styles/Colors";

const Warning = styled.div`
  border: 1px solid ${colors.interactive.dangerResting};
  border-radius: 2px;
  padding: 1em;
  background-color: ${colors.interactive.dangerHighlight};
  color: ${colors.interactive.dangerHover};
  margin-top: 1em;
  width: 28em;
`;

type WarningBarProps = {
  message?: string;
};

const WarningBar = ({ message }: WarningBarProps): React.ReactElement => {
  return (
    <Warning>
      <strong>Warning:</strong> {message}
    </Warning>
  );
};
export default WarningBar;
