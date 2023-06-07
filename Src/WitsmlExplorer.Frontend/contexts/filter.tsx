import React from "react";
import Well from "../models/well";
import { NavigationAction } from "./navigationAction";
import { ExpandTreeNodesAction } from "./navigationActions";
import NavigationType from "./navigationType";

export interface Filter {
  name: string;
  isActive: boolean;
  objectGrowing: boolean;
  wellLimit: number;
}

export const EMPTY_FILTER: Filter = {
  name: "",
  isActive: false,
  objectGrowing: false,
  wellLimit: 30
};

interface FilterContextProps {
  selectedFilter: Filter;
  updateSelectedFilter: (partialFilter: Partial<Filter>) => void;
}

export const FilterContext = React.createContext<FilterContextProps>({} as FilterContextProps);

export function FilterContextProvider({ children }: React.PropsWithChildren) {
  const [selectedFilter, setSelectedFilter] = React.useState<Filter>(EMPTY_FILTER);

  const updateSelectedFilter = React.useCallback((partialFilter: Partial<Filter>) => {
    setSelectedFilter((prevFilter) => ({
      ...prevFilter,
      ...partialFilter
    }));
  }, []);

  const contextValue: FilterContextProps = React.useMemo(
    () => ({
      selectedFilter,
      updateSelectedFilter
    }),
    [selectedFilter, updateSelectedFilter]
  );

  return <FilterContext.Provider value={contextValue}>{children}</FilterContext.Provider>;
}

export interface FilterOptions {
  matchOnlyWell?: boolean; // Only return wells where the well matches the filter
  filterWellbores?: boolean; // Filter the wellbores of the wells that don't match. Only effective if matchOnlyWell is set to false.
  dispatchNavigation?: (action: NavigationAction) => void; //A function to dispatch an action to expand tree nodes every time the filter changes.
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  matchOnlyWell: false,
  filterWellbores: false
};

const filterOnWellOrWellboreName = (wells: Well[], wellNameFilter: string, filterOptions: FilterOptions) => {
  const { matchOnlyWell, filterWellbores, dispatchNavigation } = filterOptions;
  if (!wellNameFilter || wellNameFilter === "") {
    if (filterOptions.dispatchNavigation) {
      const expandTreeNodes: ExpandTreeNodesAction = { type: NavigationType.ExpandTreeNodes, payload: { nodeIds: [] } };
      dispatchNavigation(expandTreeNodes);
    }
    return wells;
  }

  const regexPattern = wellNameFilter
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape unsupported regex-symbols (except for * and ?)
    .replace(/\*/g, ".*") // Replace * with .* to match any characters
    .replace(/\?/g, "."); // Replace ? with . to match any single character

  const regex = new RegExp(`${regexPattern}`, "i");

  const filteredWells: Well[] = [];
  const treeNodesToExpand: string[] = [];

  for (const well of wells) {
    if (regex.test(well.name)) {
      filteredWells.push(well);
    } else if (!matchOnlyWell) {
      const matchingWellbores = well.wellbores.filter((wellbore) => regex.test(wellbore.name));
      if (matchingWellbores.length > 0) {
        filteredWells.push({
          ...well,
          wellbores: filterWellbores ? matchingWellbores : well.wellbores
        });
        treeNodesToExpand.push(well.uid);
      }
    }
  }

  if (filterOptions.dispatchNavigation) {
    const expandTreeNodes: ExpandTreeNodesAction = { type: NavigationType.ExpandTreeNodes, payload: { nodeIds: treeNodesToExpand } };
    dispatchNavigation(expandTreeNodes);
  }

  return filteredWells;
};

function filterOnIsActive(wells: Well[], filterOnIsActive: boolean) {
  if (!filterOnIsActive) return wells;

  wells = wells.filter((well: Well) => well.wellbores.some((wellbore) => wellbore.isActive));
  return wells.map((well) => {
    return { ...well, wellbores: [...well.wellbores.filter((wellbore) => wellbore.isActive)] };
  });
}

function filterOnObjectGrowing(wells: Well[], filterOnObjectGrowing: boolean) {
  if (!filterOnObjectGrowing) return wells;

  return wells.map((well) => {
    return {
      ...well,
      wellbores: [
        ...well.wellbores.map((wellbore) => {
          return {
            ...wellbore,
            logs: wellbore.logs ? [...wellbore.logs.filter((logObject) => logObject.objectGrowing)] : wellbore.logs
          };
        })
      ]
    };
  });
}

function filterOnWellLimit(wells: Well[], wellLimit: number) {
  return wellLimit && wellLimit > 0 ? wells.slice(0, wellLimit) : wells;
}

export const filterWells = (wells: Well[], filter: Filter, filterOptions: FilterOptions): Well[] => {
  let filteredWells: Well[] = wells;

  if (filter) {
    filteredWells = filterOnWellOrWellboreName(filteredWells, filter.name, filterOptions);
    filteredWells = filterOnIsActive(filteredWells, filter.isActive);
    filteredWells = filterOnObjectGrowing(filteredWells, filter.objectGrowing);
    filteredWells = filterOnWellLimit(filteredWells, filter.wellLimit);
  }

  return filteredWells;
};

/**
 * Custom hook to filter an array of wells based on a provided filter object.
 * The returned filtered wells will be updated if wells, filter or options changes.
 *
 * @param wells - The array of wells to filter.
 * @param filter - The filter object containing the criteria for filtering.
 * @param options - Additional options for filtering (optional).
 *                  - matchOnlyWell: If true, only return wells where the well matches the filter. Default: false.
 *                  - filterWellbores: If true and matchOnlyWell is false, filter the wellbores of the wells that don't match. Default: false.
 *                  - dispatchNavigation: A function to dispatch an action to expand tree nodes every time the filter changes (optional).
 * @returns The filtered array of wells based on the provided filter criteria.
 */
export const useWellFilter = (wells: Well[], options?: FilterOptions): Well[] => {
  const { selectedFilter } = React.useContext(FilterContext);
  const [filteredWells, setFilteredWells] = React.useState<Well[]>([]);
  let filterOptions = React.useMemo(() => ({ ...DEFAULT_FILTER_OPTIONS, ...options }), [options]);
  const prevFilter = React.useRef<Filter>(selectedFilter);

  React.useEffect(() => {
    if (prevFilter.current === selectedFilter) {
      // Treenodes should only toggle expand state if it's the filter that has been changed
      filterOptions = { ...filterOptions, dispatchNavigation: null };
    }
    prevFilter.current = selectedFilter;

    setFilteredWells(filterWells(wells, selectedFilter, filterOptions));
  }, [wells, selectedFilter, filterOptions]);

  return filteredWells;
};
