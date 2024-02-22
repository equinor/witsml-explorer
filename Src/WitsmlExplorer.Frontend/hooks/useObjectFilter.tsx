import { useContext, useMemo } from "react";
import { Filter, FilterContext, isObjectFilterType } from "../contexts/filter";
import LogObject from "../models/logObject";
import ObjectSearchResult from "../models/objectSearchResult";
import { ObjectType, ObjectTypeToModel } from "../models/objectType";

const filterObjectsOnSearchResult = <T extends ObjectType>(
  objects: ObjectTypeToModel[T][],
  searchResults: ObjectSearchResult[]
) => {
  const uidStrings = searchResults.map((searchResult) =>
    [searchResult.wellUid, searchResult.wellboreUid, searchResult.uid].join(",")
  );
  return objects.filter((object) =>
    uidStrings.includes(
      [object.wellUid, object.wellboreUid, object.uid].join(",")
    )
  );
};

const filterLogsOnIsGrowing = (
  objects: LogObject[],
  filterOnObjectGrowing: boolean
) => {
  if (!filterOnObjectGrowing) return objects;
  return objects.filter((object) => object.objectGrowing);
};

export const filterObjects = <T extends ObjectType>(
  objects: ObjectTypeToModel[T][],
  objectType: T,
  filter: Filter
): ObjectTypeToModel[T][] => {
  let filteredObjects: ObjectTypeToModel[T][] = objects;

  if (filter && objects?.length > 0) {
    if (isObjectFilterType(filter.filterType)) {
      filteredObjects = filterObjectsOnSearchResult<T>(
        filteredObjects,
        filter.searchResults
      );
    }
    if (objectType === ObjectType.Log) {
      filteredObjects = filterLogsOnIsGrowing(
        filteredObjects,
        filter.objectGrowing
      ) as ObjectTypeToModel[T][];
    }
  }

  return filteredObjects;
};

export const useObjectFilter = <T extends ObjectType>(
  objects: ObjectTypeToModel[T][],
  objectType: T
): ObjectTypeToModel[T][] => {
  const { selectedFilter } = useContext(FilterContext);

  const filteredObjects = useMemo(() => {
    return filterObjects<T>(objects, objectType, selectedFilter);
  }, [
    objects,
    objectType,
    selectedFilter.filterType,
    selectedFilter.searchResults,
    selectedFilter.objectGrowing
  ]);

  return filteredObjects;
};
