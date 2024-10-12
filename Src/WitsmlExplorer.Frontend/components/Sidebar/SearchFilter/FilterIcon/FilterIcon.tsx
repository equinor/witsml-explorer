import React from "react";
import FilterPanel from "../../FilterPanel.tsx";
import { Box } from "@mui/material";
import { Icon } from "@equinor/eds-core-react";
import { Button } from "../../../StyledComponents/Button.tsx";

type FilterIconProps = {
  color: string;
  expanded: boolean;
  onClick: () => void;
};

const FilterIcon = ({ onClick, expanded, color }: FilterIconProps) => {
  return (
    <Button
      variant="ghost_icon"
      onClick={onClick}
      aria-label={expanded ? "activeFilter" : "filter"}
    >
      <Icon name={expanded ? "activeFilter" : "filter"} color={color} />
    </Button>
  );
};

FilterIcon.Popup = () => (
  <Box
    sx={{
      zIndex: 10,
      position: "absolute",
      width: "inherit",
      top: "6.3rem",
      minWidth: "174px",
      pr: "0.1em"
    }}
  >
    <FilterPanel />
  </Box>
);

export default FilterIcon;
