import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import { NavigationAction } from "contexts/navigationAction";
import { ExpandTreeNodesAction } from "contexts/navigationActions";
import NavigationType from "contexts/navigationType";
import ObjectSearchResult from "models/objectSearchResult";
import { ObjectType } from "models/objectType";
import Well from "models/well";
import Wellbore from "models/wellbore";
import React from "react";

export interface Filter {
  name: string;
  isActive: boolean;
  objectGrowing: boolean;
  wellLimit: number;
  filterType: FilterType;
  searchResults?: ObjectSearchResult[];
  objectVisibilityStatus: Record<ObjectType, VisibilityStatus>;
}

export enum VisibilityStatus {
  Visible,
  Hidden,
  Disabled
}

// Filter by wells and/or wellbores
export enum WellFilterType {
  Well = "Well",
  WellOrWellbore = "Wells / Wellbores"
}

// Filter by properties already fetched for wells
export enum WellPropertyFilterType {
  Field = "Field",
  License = "License"
}

// Filter by an object's property. Objects set in this filter type will be fetched on demand.
// When searching without wildcards, it will try to find exact matches (quick).
// When searching with wildcards (or an empty string), it will fetch all the objects, and then filter them in the frontend (slow).
// It will only fetch all objects once. Afterwards, all searches will be filtered in the fetched objects in the frontend, until a different object is chosen to search by.
export enum ObjectFilterType {
  Log = "Log",
  Rig = "Rig",
  ServiceCompany = "Service Company" // A property for both logs and trajectories.
}

// Mapping from ObjectFilterType to the objects the property belongs to.
export const objectFilterTypeToObjects = {
  [ObjectFilterType.Log]: [ObjectType.Log],
  [ObjectFilterType.Rig]: [ObjectType.Rig],
  [ObjectFilterType.ServiceCompany]: [ObjectType.Log, ObjectType.Trajectory]
};

// Mapping from every filter type to the property to filter by.
// For WellFilterType, the property must be a property of a Well and Wellbore.
// For ObjectFilterType, the property can be any string property under an object.
export const filterTypeToProperty = {
  [WellFilterType.Well]: "name",
  [WellFilterType.WellOrWellbore]: "name",
  [WellPropertyFilterType.Field]: "field",
  [WellPropertyFilterType.License]: "numLicense",
  [ObjectFilterType.Log]: "name",
  [ObjectFilterType.Rig]: "name",
  [ObjectFilterType.ServiceCompany]: "serviceCompany"
};

// A function to get a description for a filter type.
// Is shown when hovering over the (i) on the option for that type.
// Return null for types that should not have any description.
export const getFilterTypeInformation = (filterType: FilterType): string => {
  const wildCardString =
    "Use wildcard ? for one unknown character.\nUse wildcard * for x unknown characters.";
  const onDemandString = `${pluralize(
    filterType
  )} will be fetched on demand by typing 'Enter' or clicking the search icon.`;
  if (isWellFilterType(filterType) || isWellPropertyFilterType(filterType)) {
    return wildCardString;
  } else if (isObjectFilterType(filterType)) {
    return `${onDemandString}\n${wildCardString}`;
  }
  return null;
};

export type FilterType =
  | WellFilterType
  | WellPropertyFilterType
  | ObjectFilterType;
export const FilterType = {
  ...WellFilterType,
  ...WellPropertyFilterType,
  ...ObjectFilterType
};

export const isWellFilterType = (filterType: FilterType): boolean => {
  return Object.values<string>(WellFilterType).includes(filterType);
};

export const isWellPropertyFilterType = (filterType: FilterType): boolean => {
  return Object.values<string>(WellPropertyFilterType).includes(filterType);
};

export const isObjectFilterType = (filterType: FilterType): boolean => {
  return Object.values<string>(ObjectFilterType).includes(filterType);
};

export const allVisibleObjects: Record<ObjectType, VisibilityStatus> =
  {} as Record<ObjectType, VisibilityStatus>;
Object.values(ObjectType).forEach(
  (object) => (allVisibleObjects[object] = VisibilityStatus.Visible)
);

export const EMPTY_FILTER: Filter = {
  name: "",
  isActive: false,
  objectGrowing: false,
  wellLimit: 30,
  filterType: WellFilterType.Well,
  searchResults: [],
  objectVisibilityStatus: allVisibleObjects
};

interface FilterContextProps {
  selectedFilter: Filter;
  updateSelectedFilter: (partialFilter: Partial<Filter>) => void;
}

export const FilterContext = React.createContext<FilterContextProps>(
  {} as FilterContextProps
);

export interface FilterContextProviderProps {
  initialFilter?: Partial<Filter>;
  children?: React.ReactNode;
}

export function FilterContextProvider({
  initialFilter,
  children
}: FilterContextProviderProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<Filter>({
    ...EMPTY_FILTER,
    ...initialFilter
  });

  const updateSelectedFilter = React.useCallback(
    (partialFilter: Partial<Filter>) => {
      setSelectedFilter((prevFilter) => ({
        ...prevFilter,
        ...partialFilter
      }));
    },
    []
  );

  const contextValue: FilterContextProps = React.useMemo(
    () => ({
      selectedFilter,
      updateSelectedFilter
    }),
    [selectedFilter, updateSelectedFilter]
  );

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}

export interface FilterOptions {
  filterWellbores?: boolean; // Filter the wellbores (if the well itself doesn't match). Setting this to true will remove wellbores that don't match.
  dispatchNavigation?: (action: NavigationAction) => void; //A function to dispatch an action to expand tree nodes every time the filter changes.
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  filterWellbores: false
};

const filterOnName = (
  wells: Well[],
  filter: Filter,
  filterOptions: FilterOptions
) => {
  const { name, filterType, searchResults } = filter;
  const { filterWellbores, dispatchNavigation } = filterOptions;
  const isObjectFilter = isObjectFilterType(filterType);
  const isWellPropertyFilter = isWellPropertyFilterType(filterType);
  const isWellFilter = isWellFilterType(filterType);
  const property = isObjectFilter
    ? "searchProperty"
    : filterTypeToProperty[filterType];

  if (!name) {
    if (filterOptions.dispatchNavigation) {
      const expandTreeNodes: ExpandTreeNodesAction = {
        type: NavigationType.ExpandTreeNodes,
        payload: { nodeIds: [] }
      };
      dispatchNavigation(expandTreeNodes);
    }
    if (isWellFilter) {
      return wells;
    }
  }

  const regex = getSearchRegex(name);

  const filteredWells: Well[] = [];
  const treeNodesToExpand: string[] = [];

  if (isWellFilter || isWellPropertyFilter) {
    for (const well of wells) {
      const wellPropertyValue = well[property as keyof Well];
      if (regex.test(wellPropertyValue ? (wellPropertyValue as string) : "")) {
        filteredWells.push(well);
      } else if (filterType === WellFilterType.WellOrWellbore) {
        const matchingWellbores = well.wellbores.filter((wellbore) =>
          regex.test(wellbore[property as keyof Wellbore] as string)
        );
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
    const filteredObjects = isSitecomSyntax(name)
      ? searchResults
      : searchResults.filter((object) =>
          regex.test(object[property as keyof ObjectSearchResult])
        );
    const filteredWellUids = filteredObjects.map((object) => object.wellUid);
    const filteredWellAndWellboreUids = filteredObjects.map((object) =>
      [object.wellUid, object.wellboreUid].join(",")
    );

    for (const well of wells) {
      if (filteredWellUids.includes(well.uid)) {
        if (filterWellbores) {
          const filteredWellbores = well.wellbores.filter((wellbore) =>
            filteredWellAndWellboreUids.includes(
              [well.uid, wellbore.uid].join(",")
            )
          );
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
    const expandTreeNodes: ExpandTreeNodesAction = {
      type: NavigationType.ExpandTreeNodes,
      payload: { nodeIds: treeNodesToExpand }
    };
    dispatchNavigation(expandTreeNodes);
  }

  return filteredWells;
};

export const isSitecomSyntax = (str: string) => {
  return /^sel\(.*\)$/.test(str);
};

export const getSearchRegex = (str: string): RegExp => {
  let newStr = str;
  if (str == "") {
    newStr = ".+"; // Any string that is not empty
  } else {
    newStr = str
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape unsupported regex-symbols (except for * and ?)
      .replace(/\*/g, ".*") // Replace * with .* to match any characters
      .replace(/\?/g, "."); // Replace ? with . to match any single character
  }
  return new RegExp(newStr, "i");
};

function filterOnIsActive(wells: Well[], filterOnIsActive: boolean) {
  if (!filterOnIsActive) return wells;

  wells = wells.filter((well: Well) =>
    well.wellbores.some((wellbore) => wellbore.isActive)
  );
  return wells.map((well) => {
    return {
      ...well,
      wellbores: [...well.wellbores.filter((wellbore) => wellbore.isActive)]
    };
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
            logs: wellbore.logs
              ? [
                  ...wellbore.logs.filter(
                    (logObject) => logObject.objectGrowing
                  )
                ]
              : wellbore.logs
          };
        })
      ]
    };
  });
}

function filterOnWellLimit(wells: Well[], wellLimit: number) {
  return wellLimit && wellLimit > 0 ? wells.slice(0, wellLimit) : wells;
}

export const filterWells = (
  wells: Well[],
  filter: Filter,
  filterOptions: FilterOptions
): Well[] => {
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
export const useWellFilter = (
  wells: Well[],
  options?: FilterOptions
): Well[] => {
  const { selectedFilter } = React.useContext(FilterContext);
  const [filteredWells, setFilteredWells] = React.useState<Well[]>([]);
  let filterOptions = React.useMemo(
    () => ({ ...DEFAULT_FILTER_OPTIONS, ...options }),
    [options]
  );
  const prevFilter = React.useRef<Filter>(selectedFilter);

  React.useEffect(() => {
    if (
      prevFilter.current.filterType === selectedFilter.filterType &&
      prevFilter.current.name == selectedFilter.name
    ) {
      // Treenodes should only toggle expand state if the filter type or name has changed
      filterOptions = { ...filterOptions, dispatchNavigation: null };
    }
    prevFilter.current = selectedFilter;

    setFilteredWells(filterWells(wells, selectedFilter, filterOptions));
  }, [
    wells,
    filterOptions,
    selectedFilter.filterType,
    selectedFilter.isActive,
    selectedFilter.name,
    selectedFilter.objectGrowing,
    selectedFilter.searchResults,
    selectedFilter.wellLimit
  ]);

  return filteredWells;
};
