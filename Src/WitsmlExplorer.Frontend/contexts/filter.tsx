import React from "react";
import ObjectOnWellbore from "../models/objectOnWellbore";
import { ObjectType } from "../models/objectType";
import Well from "../models/well";
import { NavigationAction } from "./navigationAction";
import { ExpandTreeNodesAction } from "./navigationActions";
import NavigationType from "./navigationType";

export interface Filter {
  name: string;
  isActive: boolean;
  objectGrowing: boolean;
  wellLimit: number;
  filterType: FilterType;
  objectsOnWellbore?: ObjectOnWellbore[];
}

export enum WellFilterType {
  Well = "Well",
  WellOrWellbore = "Wells / Wellbores"
}

export enum ObjectFilterType {
  Rig = "Rig"
  // Add any other objects from ObjectType you want to search for by name here.
}

export type FilterType = WellFilterType | ObjectFilterType;
export const FilterType = { ...WellFilterType, ...ObjectFilterType };

export const EMPTY_FILTER: Filter = {
  name: "",
  isActive: false,
  objectGrowing: false,
  wellLimit: 30,
  filterType: WellFilterType.Well,
  objectsOnWellbore: []
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
  filterWellbores?: boolean; // Filter the wellbores (if the well itself doesn't match). Setting this to true will remove wellbores that doesn't match.
  dispatchNavigation?: (action: NavigationAction) => void; //A function to dispatch an action to expand tree nodes every time the filter changes.
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  filterWellbores: false
};

const filterOnName = (wells: Well[], filter: Filter, filterOptions: FilterOptions) => {
  const { name, filterType, objectsOnWellbore } = filter;
  const { filterWellbores, dispatchNavigation } = filterOptions;
  const isObjectFilter = Object.values<string>(ObjectType).includes(filterType);
  const isWellTypeFilter = Object.values<string>(WellFilterType).includes(filterType);

  if (!name || name === "") {
    if (filterOptions.dispatchNavigation) {
      const expandTreeNodes: ExpandTreeNodesAction = { type: NavigationType.ExpandTreeNodes, payload: { nodeIds: [] } };
      dispatchNavigation(expandTreeNodes);
    }
    if (isWellTypeFilter) {
      return wells;
    }
  }

  const regexPattern = name
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape unsupported regex-symbols (except for * and ?)
    .replace(/\*/g, ".*") // Replace * with .* to match any characters
    .replace(/\?/g, "."); // Replace ? with . to match any single character

  const regex = new RegExp(`${regexPattern}`, "i");

  const filteredWells: Well[] = [];
  const treeNodesToExpand: string[] = [];

  if (isWellTypeFilter) {
    for (const well of wells) {
      if (regex.test(well.name)) {
        filteredWells.push(well);
      } else if (filterType === WellFilterType.WellOrWellbore) {
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
  } else if (isObjectFilter) {
    const filteredObjects = objectsOnWellbore.filter((object) => regex.test(object.name));
    const filteredWellUids = filteredObjects.map((object) => object.wellUid);
    const filteredWellAndWellboreUids = filteredObjects.map((object) => [object.wellUid, object.wellboreUid].join(","));
    for (const well of wells) {
      if (filteredWellUids.includes(well.uid)) {
        if (filterWellbores) {
          const filteredWellbores = well.wellbores.filter((wellbore) => filteredWellAndWellboreUids.includes([well.uid, wellbore.uid].join(",")));
          filteredWells.push({
            ...well,
            wellbores: filteredWellbores
          });
        } else {
          filteredWells.push(well);
        }
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
    filteredWells = filterOnName(filteredWells, filter, filterOptions);
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
 * @param options - Additional options for filtering (optional).
 *                  - filterWellbores: If true, filter the wellbores of the wells that don't match. Default: false.
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
