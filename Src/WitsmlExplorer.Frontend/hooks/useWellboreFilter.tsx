import { useContext, useMemo } from "react";
import {
  Filter,
  FilterContext,
  isObjectFilterType,
  isWellboreFilterType
} from "../contexts/filter";
import ObjectSearchResult from "../models/objectSearchResult";
import Wellbore from "../models/wellbore";

function filterWellboresOnIsActive(
  wellbores: Wellbore[],
  filterOnIsActive: boolean
) {
  if (!filterOnIsActive) return wellbores;
  return wellbores.filter((wellbore: Wellbore) => wellbore.isActive);
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
  }

  return filteredWellbores;
};

export const useWellboreFilter = (wellbores: Wellbore[]): Wellbore[] => {
  const { selectedFilter } = useContext(FilterContext);

  const filteredWellbores = useMemo(() => {
    return filterWellbores(wellbores, selectedFilter);
  }, [
    wellbores,
    selectedFilter.filterType,
    selectedFilter.isActive,
    selectedFilter.name,
    selectedFilter.searchResults,
    selectedFilter.wellboreSearchResults
  ]);

  return filteredWellbores;
};
