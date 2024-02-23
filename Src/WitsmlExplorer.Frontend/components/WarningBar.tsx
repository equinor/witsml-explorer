import React from "react";
import { Warning } from "./StyledComponents/Warning";

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
