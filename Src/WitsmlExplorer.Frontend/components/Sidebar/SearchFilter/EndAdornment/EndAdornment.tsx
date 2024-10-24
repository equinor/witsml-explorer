import { Button } from "../../../StyledComponents/Button.tsx";
import { Icon } from "@equinor/eds-core-react";
import { Box } from "@mui/material";
import React, { FC } from "react";

type EndAdornmentProps = {
  searchActive: boolean;
  onResetFilter: () => void;
  onOpenSearch: () => void;
  color: string;
};

const EndAdornment: FC<EndAdornmentProps> = ({
  searchActive,
  onOpenSearch,
  onResetFilter,
  color
}) => (
  <Box display="flex" alignItems="center">
    {searchActive && (
      <Button variant="ghost_icon" onClick={onResetFilter} aria-label="Clear">
        <Icon name={"clear"} color={color} size={18} />
      </Button>
    )}
    <Button variant="ghost_icon" onClick={onOpenSearch} aria-label="Search">
      <Icon name="search" color={color} />
    </Button>
  </Box>
);

export default EndAdornment;
