import React from "react";
import { Icon, Tooltip } from "@equinor/eds-core-react";

type AlertInformationProps = {
  message?: string;
};

const AlertInformation = ({}: AlertInformationProps): React.ReactElement => {
  return (
    <>
      <Tooltip title="Explore more actions">
        <Icon name="explore" />
      </Tooltip>
    </>
  );
};
export default AlertInformation;
