import {
  QueryClient,
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { useMemo } from "react";
import {
  MILLIS_IN_SECOND,
  SECONDS_IN_MINUTE
} from "../../components/Constants";
import {
  ObjectFilterType,
  filterTypeToProperty,
  getListedObjects,
  getSearchRegex,
  isSitecomSyntax,
  objectFilterTypeToObjects
} from "../../contexts/filter";
import ObjectSearchResult from "../../models/objectSearchResult";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import {
  QUERY_KEY_OBJECT_SEARCH,
  QUERY_KEY_OBJECT_SEARCH_ALL
} from "./queryKeys";
import { QueryOptions } from "./queryOptions";

export const getObjectSearchQueryKey = (
  serverUrl: string,
  filterType: ObjectFilterType,
  value: string,
  fetchAllObjects: boolean
) => {
  return [
    QUERY_KEY_OBJECT_SEARCH,
    serverUrl?.toLowerCase(),
    filterType,
    fetchAllObjects ? QUERY_KEY_OBJECT_SEARCH_ALL : "",
    fetchAllObjects || needToFetchAllObjects(value) ? "" : value?.toLowerCase()
  ];
};

export const objectSearchQuery = (
  server: Server,
  filterType: ObjectFilterType,
  value: string,
  fetchAllObjects: boolean,
  options?: QueryOptions
) => ({
  queryKey: getObjectSearchQueryKey(
    server?.url,
    filterType,
    value,
    fetchAllObjects
  ),
  queryFn: async () => {
    const searchResults = await fetchObjects(
      server,
      filterType,
      value,
      fetchAllObjects
    );
    return searchResults;
  },
  ...options,
  enabled:
    !!server &&
    !!filterType &&
    !(value === null || value === undefined) &&
    !(options?.enabled === false),
  retry: 0,
  gcTime: 5 * SECONDS_IN_MINUTE * MILLIS_IN_SECOND // We don't want to cache unused search results for too long.
});

type ObjectSearchQueryResult = Omit<
  QueryObserverResult<ObjectSearchResult[], unknown>,
  "data"
> & {
  searchResults: ObjectSearchResult[];
};

export const useGetObjectSearch = (
  server: Server,
  filterType: ObjectFilterType,
  value: string,
  fetchAllObjects: boolean,
  options?: QueryOptions
): ObjectSearchQueryResult => {
  const queryClient = useQueryClient();
  const cachedAllObjects = getCachedAllObjects(
    queryClient,
    server.url,
    filterType
  );
  const { data, ...state } = useQuery<ObjectSearchResult[]>(
    objectSearchQuery(
      server,
      filterType,
      value,
      fetchAllObjects || !!cachedAllObjects,
      {
        ...options,
        enabled: !(options?.enabled === false) && !cachedAllObjects
      }
    )
  );

  const dataToFilter = useMemo(
    () => cachedAllObjects ?? data ?? [],
    [data, cachedAllObjects]
  );

  const filteredData = useMemo(() => {
    const regex = getSearchRegex(value, true);
    return dataToFilter.filter(
      (result) => isSitecomSyntax(value) || regex.test(result.searchProperty)
    );
  }, [dataToFilter, value]);

  return { searchResults: filteredData, ...state };
};

const fetchObjects = async (
  server: Server,
  objectFilterType: ObjectFilterType,
  value = "",
  fetchAllObjects: boolean
): Promise<ObjectSearchResult[]> => {
  if (!fetchAllObjects && needToFetchAllObjects(value)) {
    throw new Error(
      `The given search will fetch all ${getListedObjects(
        objectFilterType
      )}.\n\nDo you still want to proceed?`
    );
  }
  const searchResults: ObjectSearchResult[] = [];
  const errors: Error[] = [];
  const objectTypes = objectFilterTypeToObjects[objectFilterType];

  const objectPromises = objectTypes.map(async (objectType) => {
    try {
      const objects = await ObjectService.getObjectsWithParamByType(
        objectType as ObjectType,
        filterTypeToProperty[objectFilterType],
        fetchAllObjects || needToFetchAllObjects(value) ? "" : value,
        undefined,
        server
      );
      searchResults.push(...objects);
    } catch (error) {
      errors.push(error);
    }
  });

  await Promise.all(objectPromises);

  if (errors.length > 0) {
    throw new Error(
      `${errors.join(
        "\n"
      )}\n\nThe search can still be performed by fetching all ${getListedObjects(
        objectFilterType
      )} before filtering.\n\nDo you still want to proceed?`
    );
  }
  return searchResults;
};

const getCachedAllObjects = (
  queryClient: QueryClient,
  serverUrl: string,
  filterType: ObjectFilterType
) => {
  const allObjectsQueryKey = getObjectSearchQueryKey(
    serverUrl,
    filterType,
    "",
    true
  );
  const cachedState = queryClient.getQueryState(allObjectsQueryKey);
  if (cachedState?.isInvalidated) {
    return null;
  }
  return queryClient.getQueryData<ObjectSearchResult[]>(allObjectsQueryKey);
};

const needToFetchAllObjects = (value: string) => {
  return /^$|[*?]/.test(value);
};
