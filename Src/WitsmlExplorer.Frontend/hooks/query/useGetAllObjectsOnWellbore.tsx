import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { Server } from "../../models/server";
import SelectableObjectOnWellbore from "models/selectableObjectOnWellbore";
import { QUERY_KEY_ALL_OBJECTS_ON_WELLBORE } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import ObjectService from "services/objectService";

export const getAllObjectsOnWellboreQueryKey = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string
) => {
  return [
    QUERY_KEY_ALL_OBJECTS_ON_WELLBORE,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase(),
    wellboreUid?.toLowerCase()
  ];
};

export const mixedObjectsReferenceQuery = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
) => ({
  queryKey: getAllObjectsOnWellboreQueryKey(server?.url, wellUid, wellboreUid),
  queryFn: async () => {
    const objectsOnWellbore = await ObjectService.getAllObjectsOnWellbore(
      wellUid,
      wellboreUid,
      null,
      server
    );
    return objectsOnWellbore;
  },
  ...options,
  enabled:
    !!server && !!wellUid && !!wellboreUid && !(options?.enabled === false)
});

type ObjectsOnWellboreQueryResult = Omit<
  QueryObserverResult<SelectableObjectOnWellbore[], unknown>,
  "data"
> & {
  objectsOnWellbore: SelectableObjectOnWellbore[];
};

export const useGetAllObjectsOnWellbore = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
): ObjectsOnWellboreQueryResult => {
  const { data, ...state } = useQuery<SelectableObjectOnWellbore[]>(
    mixedObjectsReferenceQuery(server, wellUid, wellboreUid, options)
  );
  return { objectsOnWellbore: data, ...state };
};
