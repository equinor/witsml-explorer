import {
  QueryClient,
  QueryObserverResult,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { ObjectType, ObjectTypeToModel } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import { QUERY_KEY_OBJECT } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { getObjectsQueryKey } from "./useGetObjects";

export const getObjectQueryKey = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectType: ObjectType,
  objectUid: string
) => {
  return [
    QUERY_KEY_OBJECT,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase(),
    wellboreUid?.toLowerCase(),
    objectType?.toLowerCase(),
    objectUid?.toLowerCase()
  ];
};

const updatePartialObjects = <T extends ObjectType>(
  queryClient: QueryClient,
  server: Server,
  objectType: ObjectType,
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  object: ObjectTypeToModel[T]
) => {
  const objectsQueryKey = getObjectsQueryKey(
    server?.url,
    wellUid,
    wellboreUid,
    objectType
  );
  const existingObjects =
    queryClient.getQueryData<ObjectTypeToModel[T][]>(objectsQueryKey);
  if (existingObjects) {
    const existingObjectIndex = existingObjects.findIndex(
      (o) => o.uid === objectUid
    );
    if (object) {
      existingObjects[existingObjectIndex] = object;
    } else {
      existingObjects.splice(existingObjectIndex, 1);
    }
    queryClient.setQueryData<ObjectTypeToModel[T][]>(
      objectsQueryKey,
      existingObjects
    );
  }
};

export const objectQuery = <T extends ObjectType>(
  queryClient: QueryClient,
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T,
  objectUid: string,
  options?: QueryOptions
) => ({
  queryKey: getObjectQueryKey(
    server?.url,
    wellUid,
    wellboreUid,
    objectType,
    objectUid
  ),
  queryFn: async () => {
    const object = await ObjectService.getObject<T>(
      wellUid,
      wellboreUid,
      objectUid,
      objectType,
      null,
      server
    );
    updatePartialObjects(
      queryClient,
      server,
      objectType,
      wellUid,
      wellboreUid,
      objectUid,
      object
    );
    return object;
  },
  ...options,
  gcTime: 0,
  enabled:
    !!server &&
    !!wellUid &&
    !!wellboreUid &&
    !!objectType &&
    !!objectUid &&
    !(options?.enabled === false)
});

type ObjectQueryResult<T extends ObjectType> = Omit<
  QueryObserverResult<ObjectTypeToModel[T], unknown>,
  "data"
> & {
  object: ObjectTypeToModel[T];
};

export const useGetObject = <T extends ObjectType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T,
  objectUid: string,
  options?: QueryOptions
): ObjectQueryResult<T> => {
  const queryClient = useQueryClient();
  const { data, ...state } = useQuery<ObjectTypeToModel[T]>(
    objectQuery<T>(
      queryClient,
      server,
      wellUid,
      wellboreUid,
      objectType,
      objectUid,
      options
    )
  );
  return { object: data, ...state };
};
