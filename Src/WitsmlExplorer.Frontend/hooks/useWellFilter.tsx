import { useContext, useMemo } from "react";
import {
  Filter,
  FilterContext,
  filterTypeToProperty,
  getSearchRegex,
  isObjectFilterType,
  isWellFilterType,
  isWellPropertyFilterType
} from "../contexts/filter";
import ObjectSearchResult from "../models/objectSearchResult";
import Well from "../models/well";

function filterWellsOnIsActive(wells: Well[], filterOnIsActive: boolean) {
  if (!filterOnIsActive) return wells;
  return wells.filter((well: Well) => well.isActive);
}

const filterWellsOnWellProperty = (
  wells: Well[],
  property: string,
  value: string
) => {
  if (!value) return wells;
  const regex = getSearchRegex(value);
  return wells.filter((well) => {
    const wellPropertyValue = well[property as keyof Well];
    return regex.test(wellPropertyValue ? (wellPropertyValue as string) : "");
  });
};

const filterWellsOnSearchResult = (
  wells: Well[],
  searchResults: ObjectSearchResult[]
) => {
  const wellUids = searchResults.map((searchResult) => searchResult.wellUid);
  return wells.filter((well) => wellUids.includes(well.uid));
};

export const filterWells = (wells: Well[], filter: Filter): Well[] => {
  let filteredWells: Well[] = wells;

  if (filter && wells?.length > 0) {
    if (
      isWellFilterType(filter.filterType) ||
      isWellPropertyFilterType(filter.filterType)
    ) {
      filteredWells = filterWellsOnWellProperty(
        filteredWells,
        filterTypeToProperty[filter.filterType],
        filter.name
      );
    } else if (isObjectFilterType(filter.filterType)) {
      filteredWells = filterWellsOnSearchResult(
        filteredWells,
        filter.searchResults
      );
    }
    filteredWells = filterWellsOnIsActive(filteredWells, filter.isActive);
  }

  return filteredWells;
};

export const useWellFilter = (wells: Well[]): Well[] => {
  const { selectedFilter } = useContext(FilterContext);

  const filteredWells = useMemo(() => {
    return filterWells(wells, selectedFilter);
  }, [
    wells,
    selectedFilter.filterType,
    selectedFilter.isActive,
    selectedFilter.name,
    selectedFilter.searchResults
  ]);

  return filteredWells;
};
