import { useContext, useMemo } from "react";
import {
  Filter,
  FilterContext,
  isObjectFilterType,
  isWellboreFilterType
} from "../contexts/filter";
import ObjectSearchResult from "../models/objectSearchResult";
import Wellbore from "../models/wellbore";
import { UidMappingBasicInfo } from "../models/uidMapping.tsx";

function filterWellboresOnIsActive(
  wellbores: Wellbore[],
  filterOnIsActive: boolean
) {
  if (!filterOnIsActive) return wellbores;
  return wellbores.filter((wellbore: Wellbore) => wellbore.isActive);
}

function filterWellboresOnUidMapping(
  wellbores: Wellbore[],
  filterOnUidMapping: boolean,
  uidMappingBasicInfos: UidMappingBasicInfo[]
) {
  if (!filterOnUidMapping) {
    return wellbores;
  } else if (!uidMappingBasicInfos || uidMappingBasicInfos.length == 0) {
    return [];
  }
  return wellbores.filter((wb) =>
    uidMappingBasicInfos.some(
      (m) => m.sourceWellId === wb.wellUid && m.sourceWellboreId === wb.uid
    )
  );
}

const filterWellboresOnSearchResult = (
  wellbores: Wellbore[],
  searchResults: ObjectSearchResult[]
) => {
  const wellAndWellboreUids = searchResults.map((searchResult) =>
    [searchResult.wellUid, searchResult.wellboreUid].join(",")
  );
  return wellbores.filter((wellbore) =>
    wellAndWellboreUids.includes([wellbore.wellUid, wellbore.uid].join(","))
  );
};

const filterWellboresOnWellboreSearchResult = (
  wellbores: Wellbore[],
  wellboreSearchResult: Wellbore[]
) => {
  const wellAndWellboreUids = wellboreSearchResult.map((searchResult) =>
    [searchResult.wellUid, searchResult.uid].join(",")
  );
  return wellbores.filter((wellbore) =>
    wellAndWellboreUids.includes([wellbore.wellUid, wellbore.uid].join(","))
  );
};

export const filterWellbores = (
  wellbores: Wellbore[],
  uidMappingBasicInfos: UidMappingBasicInfo[],
  filter: Filter
): Wellbore[] => {
  let filteredWellbores: Wellbore[] = wellbores;

  if (filter && wellbores?.length > 0) {
    if (isObjectFilterType(filter.filterType)) {
      filteredWellbores = filterWellboresOnSearchResult(
        filteredWellbores,
        filter.searchResults
      );
    } else if (isWellboreFilterType(filter.filterType)) {
      filteredWellbores = filterWellboresOnWellboreSearchResult(
        filteredWellbores,
        filter.wellboreSearchResults
      );
    }
    filteredWellbores = filterWellboresOnIsActive(
      filteredWellbores,
      filter.isActive
    );
    filteredWellbores = filterWellboresOnUidMapping(
      filteredWellbores,
      filter.uidMapping,
      uidMappingBasicInfos
    );
  }

  return filteredWellbores;
};

export const useWellboreFilter = (
  wellbores: Wellbore[],
  uidMappingBasicInfos: UidMappingBasicInfo[]
): Wellbore[] => {
  const { selectedFilter } = useContext(FilterContext);

  const filteredWellbores = useMemo(() => {
    return filterWellbores(wellbores, uidMappingBasicInfos, selectedFilter);
  }, [
    wellbores,
    selectedFilter.filterType,
    selectedFilter.isActive,
    selectedFilter.uidMapping,
    selectedFilter.name,
    selectedFilter.searchResults,
    selectedFilter.wellboreSearchResults
  ]);

  return filteredWellbores;
};
