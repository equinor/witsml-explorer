import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { Server } from "../../models/server";
import { ExpandableObjectsCount } from "../../models/wellbore";
import ObjectService from "../../services/objectService";
import { QUERY_KEY_OBJECT_COUNT, QUERY_KEY_WELLBORE } from "./queryKeys";
import { QueryOptions } from "./queryOptions";

export const getObjectCountQueryKey = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string
) => {
  return [
    QUERY_KEY_WELLBORE,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase(),
    wellboreUid?.toLowerCase(),
    QUERY_KEY_OBJECT_COUNT
  ];
};

export const objectCountQuery = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
) => ({
  queryKey: getObjectCountQueryKey(server?.url, wellUid, wellboreUid),
  queryFn: async () => {
    const objectCount = await ObjectService.getExpandableObjectsCount(
      wellUid,
      wellboreUid,
      null,
      server
    );
    return objectCount;
  },
  ...options,
  enabled:
    !!server && !!wellUid && !!wellboreUid && !(options?.enabled === false)
});

type ObjectCountQueryResult = Omit<
  QueryObserverResult<ExpandableObjectsCount, unknown>,
  "data"
> & {
  objectCount: ExpandableObjectsCount;
};

export const useGetObjectCount = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
): ObjectCountQueryResult => {
  const { data, ...state } = useQuery<ExpandableObjectsCount>(
    objectCountQuery(server, wellUid, wellboreUid, options)
  );
  return { objectCount: data, ...state };
};
