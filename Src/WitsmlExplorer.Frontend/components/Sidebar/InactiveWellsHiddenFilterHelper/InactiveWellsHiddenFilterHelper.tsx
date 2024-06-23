import React, { FC, useContext } from "react";
import { FilterContext } from "../../../contexts/filter.tsx";
import {
  setLocalStorageItem,
  STORAGE_FILTER_ISACTIVE_KEY
} from "../../../tools/localStorageHelpers.tsx";
import { Icon } from "@equinor/eds-core-react";
import { Chip } from "../../StyledComponents/Chip";

export const InactiveWellsHiddenFilterHelper: FC = () => {
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);

  const handleClearFilterProperty = () => {
    setLocalStorageItem<boolean>(STORAGE_FILTER_ISACTIVE_KEY, false);
    updateSelectedFilter({ isActive: false });
  };

  if (!selectedFilter.isActive) return null;

  return (
    <Chip onDelete={handleClearFilterProperty} variant="default">
      <Icon name="infoCircle" />
      Inactive Wells are hidden
    </Chip>
  );
};
