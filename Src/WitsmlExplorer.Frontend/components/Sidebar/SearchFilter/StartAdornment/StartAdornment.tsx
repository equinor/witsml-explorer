import { Box } from "@mui/material";
import { Button } from "../../../StyledComponents/Button.tsx";
import { Icon } from "@equinor/eds-core-react";
import React, { FC } from "react";

type StartAdornmentProps = {
  onOpenOptions: () => void;
  color: string;
  disabled: boolean;
};

const StartAdornment: FC<StartAdornmentProps> = ({
  onOpenOptions,
  disabled,
  color
}) => (
  <Box display="flex" alignItems="center">
    <Button
      variant="ghost_icon"
      disabled={disabled}
      onClick={onOpenOptions}
      aria-label="Show Search Options"
    >
      <Icon name={"chevronDown"} color={color} />
    </Button>
  </Box>
);

export default StartAdornment;
