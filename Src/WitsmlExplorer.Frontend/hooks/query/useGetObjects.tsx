import {
  QueryClient,
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import ObjectOnWellbore from "../../models/objectOnWellbore";
import { ObjectType, ObjectTypeToModel } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import { QUERY_KEY_OBJECTS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { getObjectQueryKey } from "./useGetObject";

export const getObjectsQueryKey = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectType: ObjectType
) => {
  return [
    QUERY_KEY_OBJECTS,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase(),
    wellboreUid?.toLowerCase(),
    objectType?.toLowerCase()
  ];
};

const updateIndividualObjects = (
  queryClient: QueryClient,
  server: Server,
  objectType: ObjectType,
  objects: ObjectOnWellbore[]
) => {
  objects.forEach((object) =>
    queryClient.setQueryData<ObjectOnWellbore>(
      getObjectQueryKey(
        server?.url,
        object.wellUid,
        object.wellboreUid,
        objectType,
        object.uid
      ),
      object
    )
  );
};

export const objectsQuery = <T extends ObjectType>(
  queryClient: QueryClient,
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T,
  options?: QueryOptions
) => ({
  queryKey: getObjectsQueryKey(server?.url, wellUid, wellboreUid, objectType),
  queryFn: async () => {
    const objects = await ObjectService.getObjects<T>(
      wellUid,
      wellboreUid,
      objectType,
      null,
      server
    );
    updateIndividualObjects(queryClient, server, objectType, objects);
    return objects;
  },
  ...options,
  enabled:
    !!server &&
    !!wellUid &&
    !!wellboreUid &&
    !!objectType &&
    !(options?.enabled === false)
});

type ObjectsQueryResult<T extends ObjectType> = Omit<
  QueryObserverResult<ObjectTypeToModel[T][], unknown>,
  "data"
> & {
  objects: ObjectTypeToModel[T][];
};

export const useGetObjects = <T extends ObjectType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T,
  options?: QueryOptions
): ObjectsQueryResult<T> => {
  const queryClient = useQueryClient();
  const { data, ...state } = useQuery<ObjectTypeToModel[T][]>(
    objectsQuery<T>(
      queryClient,
      server,
      wellUid,
      wellboreUid,
      objectType,
      options
    )
  );
  return { objects: data, ...state };
};
