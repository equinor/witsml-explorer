import React from "react";
import { pluralize } from "../components/ContextMenus/ContextMenuUtils";
import ObjectSearchResult from "../models/objectSearchResult";
import { ObjectType } from "../models/objectType";
import Well from "../models/well";
import Wellbore from "../models/wellbore";
import { NavigationAction } from "./navigationAction";
import { ExpandTreeNodesAction } from "./navigationActions";
import NavigationType from "./navigationType";

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

// Filter by an object type. The objects will be fetched for all wells and wellbores when selected as an option.
// Searching this way will support wildcards.
// This means that fetching will be slow if there are many instances of that object. Consider using ObjectPropertyFilterType which will fetch on demand.
export enum ObjectFilterType {
  Rig = "Rig"
  // Add any other objects from ObjectType you want to search for by name here.
}

// Filter by an object's property. Objects set in this filter type will be fetched on demand.
// Searching this way will not support wildcards, and needs an exact match.
export enum ObjectPropertyFilterType {
  ServiceCompany = "Service Company" // A property for both logs and trajectories.
}

// Mapping from ObjectPropertyFilterType to the objects the property belongs to.
export const objectPropertyFilterTypeToObjects = {
  [ObjectPropertyFilterType.ServiceCompany]: [ObjectType.Log, ObjectType.Trajectory]
};

// Mapping from every filter type to the property to filter by.
// For WellFilterType, the property must be a property of a Well and Wellbore.
// For ObjectFilterType, the property must be a property of an ObjectOnWellbore.
// For ObjectPropertyFilterType, the property can be any string property under an object.
export const filterTypeToProperty = {
  [WellFilterType.Well]: "name",
  [WellFilterType.WellOrWellbore]: "name",
  [WellPropertyFilterType.Field]: "field",
  [WellPropertyFilterType.License]: "numLicense",
  [ObjectFilterType.Rig]: "name",
  [ObjectPropertyFilterType.ServiceCompany]: "serviceCompany"
};

// A function to get a description for a filter type.
// Is shown when hovering over the (i) on the option for that type.
// Return null for types that should not have any description.
export const getFilterTypeInformation = (filterType: FilterType): string => {
  const wildCardString = "Use wildcard ? for one unknown character.\nUse wildcard * for x unknown characters.";
  const emptySearchStringWellbores = `Use keyword *IS_EMPTY* to search for wellbores without ${pluralize(filterType)}.`;
  const emptySearchStringWells = `Use keyword *IS_EMPTY* to search for wells without a ${filterType}.`;
  const exactSearchString = `Searching by ${filterType} only returns exact matches.`;
  if (isWellFilterType(filterType)) {
    return wildCardString;
  } else if (isWellPropertyFilterType(filterType)) {
    return `${wildCardString}\n${emptySearchStringWells}`;
  } else if (isObjectFilterType(filterType)) {
    return `${wildCardString}\n${emptySearchStringWellbores}`;
  } else if (isObjectPropertyFilterType(filterType)) {
    const lf = new Intl.ListFormat("en-US");
    return `${filterType} is a parameter under ${lf.format(
      objectPropertyFilterTypeToObjects[filterType as ObjectPropertyFilterType]
    )}, and will be fetched on demand by typing 'Enter' or clicking the search icon.\n${exactSearchString}`;
  }
  return null;
};

export type FilterType = WellFilterType | WellPropertyFilterType | ObjectFilterType | ObjectPropertyFilterType;
export const FilterType = { ...WellFilterType, ...WellPropertyFilterType, ...ObjectFilterType, ...ObjectPropertyFilterType };

export const isWellFilterType = (filterType: FilterType): boolean => {
  return Object.values<string>(WellFilterType).includes(filterType);
};

export const isWellPropertyFilterType = (filterType: FilterType): boolean => {
  return Object.values<string>(WellPropertyFilterType).includes(filterType);
};

export const isObjectFilterType = (filterType: FilterType): boolean => {
  return Object.values<string>(ObjectFilterType).includes(filterType);
};

export const isObjectPropertyFilterType = (filterType: FilterType): boolean => {
  return Object.values<string>(ObjectPropertyFilterType).includes(filterType);
};

export const allVisibleObjects: Record<ObjectType, VisibilityStatus> = {} as Record<ObjectType, VisibilityStatus>;
Object.values(ObjectType).forEach((object) => (allVisibleObjects[object] = VisibilityStatus.Visible));

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

export const FilterContext = React.createContext<FilterContextProps>({} as FilterContextProps);

export interface FilterContextProviderProps {
  initialFilter?: Partial<Filter>;
  children?: React.ReactNode;
}

export function FilterContextProvider({ initialFilter, children }: FilterContextProviderProps) {
  const [selectedFilter, setSelectedFilter] = React.useState<Filter>({ ...EMPTY_FILTER, ...initialFilter });

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
  filterWellbores?: boolean; // Filter the wellbores (if the well itself doesn't match). Setting this to true will remove wellbores that don't match.
  dispatchNavigation?: (action: NavigationAction) => void; //A function to dispatch an action to expand tree nodes every time the filter changes.
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  filterWellbores: false
};

const filterOnName = (wells: Well[], filter: Filter, filterOptions: FilterOptions) => {
  const { name, filterType, searchResults } = filter;
  const { filterWellbores, dispatchNavigation } = filterOptions;
  const isObjectPropertyFilter = isObjectPropertyFilterType(filterType);
  const isObjectFilter = isObjectFilterType(filterType);
  const isWellPropertyFilter = isWellPropertyFilterType(filterType);
  const isWellFilter = isWellFilterType(filterType);
  const property = isObjectPropertyFilter ? "searchProperty" : filterTypeToProperty[filterType];
  const findEmpty = name === "*IS_EMPTY*" && !isWellFilter && !isObjectPropertyFilter;
  const isSitecomSyntax = /^sel\(.*\)$/.test(name);
  let searchName = name;

  if (!searchName || searchName === "") {
    if (filterOptions.dispatchNavigation) {
      const expandTreeNodes: ExpandTreeNodesAction = { type: NavigationType.ExpandTreeNodes, payload: { nodeIds: [] } };
      dispatchNavigation(expandTreeNodes);
    }
    if (isWellFilter) {
      return wells;
    }
  }

  if (findEmpty) {
    searchName = "^$"; // Empty string
  } else if (searchName == "") {
    searchName = ".+"; // Any string that is not empty
  } else {
    searchName = searchName
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape unsupported regex-symbols (except for * and ?)
      .replace(/\*/g, ".*") // Replace * with .* to match any characters
      .replace(/\?/g, "."); // Replace ? with . to match any single character
  }

  const regex = new RegExp(searchName, "i");

  const filteredWells: Well[] = [];
  const treeNodesToExpand: string[] = [];

  if (isWellFilter || isWellPropertyFilter) {
    for (const well of wells) {
      const wellPropertyValue = well[property as keyof Well];
      if (regex.test(wellPropertyValue ? (wellPropertyValue as string) : "")) {
        filteredWells.push(well);
      } else if (filterType === WellFilterType.WellOrWellbore) {
        const matchingWellbores = well.wellbores.filter((wellbore) => regex.test(wellbore[property as keyof Wellbore] as string));
        if (matchingWellbores.length > 0) {
          filteredWells.push({
            ...well,
            wellbores: filterWellbores ? matchingWellbores : well.wellbores
          });
          treeNodesToExpand.push(well.uid);
        }
      }
    }
  } else if (isObjectFilter || isObjectPropertyFilter) {
    const filteredObjects = isSitecomSyntax ? searchResults : searchResults.filter((object) => regex.test(object[property as keyof ObjectSearchResult]));
    let filteredWellUids = filteredObjects.map((object) => object.wellUid);
    let filteredWellAndWellboreUids = filteredObjects.map((object) => [object.wellUid, object.wellboreUid].join(","));

    if (findEmpty) {
      const notEmptyRegex = new RegExp(".+", "i");
      const notEmptyWellboreUids = searchResults.filter((o) => notEmptyRegex.test(o[property as keyof ObjectSearchResult] || "")).map((object) => object.wellboreUid);
      const emptyFilteredWellAndWellboreUids = wells.flatMap((w) => w.wellbores?.map((wb) => [w.uid, wb.uid])).filter(([, wbUid]) => !notEmptyWellboreUids.includes(wbUid));
      filteredWellUids = emptyFilteredWellAndWellboreUids.map(([wellUid]) => wellUid);
      filteredWellAndWellboreUids = emptyFilteredWellAndWellboreUids.map((o) => o.join(","));
    }

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
    if (prevFilter.current.filterType === selectedFilter.filterType && prevFilter.current.name == selectedFilter.name) {
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
