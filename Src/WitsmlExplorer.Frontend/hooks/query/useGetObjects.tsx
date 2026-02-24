import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { ObjectType, ObjectTypeToModel } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import { QUERY_KEY_OBJECTS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";

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

export const objectsQuery = <T extends ObjectType>(
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
  const { data, ...state } = useQuery<ObjectTypeToModel[T][]>(
    objectsQuery<T>(server, wellUid, wellboreUid, objectType, options)
  );
  return { objects: data, ...state };
};
