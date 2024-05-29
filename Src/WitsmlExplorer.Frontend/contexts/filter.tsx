import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import ObjectSearchResult from "models/objectSearchResult";
import { ObjectType } from "models/objectType";
import React from "react";
import {
  STORAGE_FILTER_HIDDENOBJECTS_KEY,
  STORAGE_FILTER_ISACTIVE_KEY,
  STORAGE_FILTER_OBJECTGROWING_KEY,
  getLocalStorageItem
} from "tools/localStorageHelpers";

export interface Filter {
  name: string;
  isActive: boolean;
  objectGrowing: boolean;
  filterType: FilterType;
  searchResults?: ObjectSearchResult[];
  objectVisibilityStatus: Record<ObjectType, VisibilityStatus>;
}

export enum VisibilityStatus {
  Visible,
  Hidden
}

// Filter by well names
export enum WellFilterType {
  Well = "Well"
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

// Mapping from ObjectType to ObjectFilterType.
export const convertObjectTypeToObjectFilterType = (
  objectType: ObjectType
): ObjectFilterType[] => {
  switch (objectType) {
    case ObjectType.Log:
      return [ObjectFilterType.Log, ObjectFilterType.ServiceCompany];
    case ObjectType.Rig:
      return [ObjectFilterType.Rig];
    case ObjectType.Trajectory:
      return [ObjectFilterType.ServiceCompany];
    default:
      return undefined;
  }
};

// Mapping from every filter type to the property to filter by.
// For WellFilterType, the property must be a property of a Well and Wellbore.
// For ObjectFilterType, the property can be any string property under an object.
export const filterTypeToProperty = {
  [WellFilterType.Well]: "name",
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
    ...getLocalStorageFilter(),
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

export const getListedObjects = (
  objectFilterType: ObjectFilterType
): string => {
  const lf = new Intl.ListFormat("en-US");
  const pluralizedObjectTypes = objectFilterTypeToObjects[objectFilterType].map(
    (o) => pluralize(o)
  );
  return lf.format(pluralizedObjectTypes);
};

export const isSitecomSyntax = (str: string) => {
  return /^sel\(.*\)$/.test(str);
};

export const getSearchRegex = (str: string, exact = false): RegExp => {
  let newStr = str;
  if (!str) {
    newStr = ".+"; // Any string that is not empty
  } else {
    newStr = str
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape unsupported regex-symbols (except for * and ?)
      .replace(/\*/g, ".*") // Replace * with .* to match any characters
      .replace(/\?/g, "."); // Replace ? with . to match any single character
  }

  if (exact) {
    newStr = `^${newStr}$`;
  }

  return new RegExp(newStr, "i");
};

const getLocalStorageFilter = (): Partial<Filter> => {
  const localStorageFilter: Partial<Filter> = {};

  const hiddenItems = getLocalStorageItem<ObjectType[]>(
    STORAGE_FILTER_HIDDENOBJECTS_KEY,
    { defaultValue: [] }
  );
  if (hiddenItems) {
    const updatedVisibility = allVisibleObjects;
    hiddenItems.forEach((objectType) => {
      updatedVisibility[objectType] = VisibilityStatus.Hidden;
    });
    localStorageFilter["objectVisibilityStatus"] = updatedVisibility;
  }

  const isActive = getLocalStorageItem<boolean>(STORAGE_FILTER_ISACTIVE_KEY);
  if (isActive !== null) {
    localStorageFilter["isActive"] = isActive;
  }

  const objectGrowing = getLocalStorageItem<boolean>(
    STORAGE_FILTER_OBJECTGROWING_KEY
  );
  if (objectGrowing !== null) {
    localStorageFilter["objectGrowing"] = objectGrowing;
  }

  return localStorageFilter;
};
