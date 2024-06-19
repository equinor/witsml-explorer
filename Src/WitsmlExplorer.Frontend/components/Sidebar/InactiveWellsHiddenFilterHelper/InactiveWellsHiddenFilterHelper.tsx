import React, { FC, useContext } from "react";
import { FilterContext } from "../../../contexts/filter.tsx";
import {
  setLocalStorageItem,
  STORAGE_FILTER_ISACTIVE_KEY
} from "../../../tools/localStorageHelpers.tsx";
import { Chip, Icon } from "@equinor/eds-core-react";
import { info_circle } from "@equinor/eds-icons";

Icon.add({ info_circle });


export const InactiveWellsHiddenFilterHelper: FC = () => {
  const { selectedFilter, updateSelectedFilter } = useContext(FilterContext);

  const handleClearFilterProperty = () => {
    setLocalStorageItem<boolean>(STORAGE_FILTER_ISACTIVE_KEY, false);
    updateSelectedFilter({ isActive: false });
  };

  if (!selectedFilter.isActive) return null;

  return <Chip onDelete={handleClearFilterProperty}>
    <Icon name="info_circle" />
    Inactive Wells are hidden
  </Chip>;
};
