import Wellbore from "models/wellbore";
import { useContext, useMemo } from "react";
import {
  Filter,
  FilterContext,
  filterTypeToProperty,
  getSearchRegex,
  isObjectFilterType,
  isWellFilterType,
  isWellPropertyFilterType,
  isWellboreFilterType
} from "../contexts/filter";
import ObjectSearchResult from "../models/objectSearchResult";
import Well from "../models/well";
import { UidMappingBasicInfo } from "../models/uidMapping.tsx";

function filterWellsOnIsActive(wells: Well[], filterOnIsActive: boolean) {
  if (!filterOnIsActive) return wells;
  return wells.filter((well: Well) => well.isActive);
}

function filterWellsOnUidMapping(
  wells: Well[],
  filterOnUidMapping: boolean,
  uidMappingBasicInfos: UidMappingBasicInfo[]
) {
  if (!filterOnUidMapping) {
    return wells;
  } else if (!uidMappingBasicInfos || uidMappingBasicInfos.length == 0) {
    return [];
  }
  return wells.filter((w) =>
    uidMappingBasicInfos.some((m) => m.sourceWellId === w.uid)
  );
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
  const wellUids = searchResults.map((searchResult) =>
    searchResult.wellUid?.toLowerCase()
  );
  return wells.filter((well) => wellUids.includes(well.uid.toLowerCase()));
};

const filterWellsOnWellboreSearchResult = (
  wells: Well[],
  wellboreSearchResults: Wellbore[]
) => {
  const wellUids = wellboreSearchResults.map((searchResult) =>
    searchResult.wellUid?.toLowerCase()
  );
  return wells.filter((well) => wellUids.includes(well.uid.toLowerCase()));
};

export const filterWells = (
  wells: Well[],
  uidMappingBasicInfos: UidMappingBasicInfo[],
  filter: Filter
): Well[] => {
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
    } else if (isWellboreFilterType(filter.filterType)) {
      filteredWells = filterWellsOnWellboreSearchResult(
        filteredWells,
        filter.wellboreSearchResults
      );
    }
    filteredWells = filterWellsOnIsActive(filteredWells, filter.isActive);
    filteredWells = filterWellsOnUidMapping(
      filteredWells,
      filter.uidMapping,
      uidMappingBasicInfos
    );
  }

  return filteredWells;
};

export const useWellFilter = (
  wells: Well[],
  uidMappingBasicInfos: UidMappingBasicInfo[]
): Well[] => {
  const { selectedFilter } = useContext(FilterContext);

  const filteredWells = useMemo(() => {
    return filterWells(wells, uidMappingBasicInfos, selectedFilter);
  }, [
    wells,
    selectedFilter.filterType,
    selectedFilter.isActive,
    selectedFilter.uidMapping,
    selectedFilter.name,
    selectedFilter.searchResults,
    selectedFilter.wellboreSearchResults
  ]);

  return filteredWells;
};
