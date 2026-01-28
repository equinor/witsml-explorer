import {
  QueryObserverResult,
  useQueries,
  useQuery
} from "@tanstack/react-query";
import { ObjectType, ObjectTypeToModel } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import { QUERY_KEY_OBJECTS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import {
  TimedResponse,
  withQueryTiming,
  wrapPlaceholderData
} from "./queryTiming";

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
  queryFn: () =>
    withQueryTiming(() =>
      ObjectService.getObjects<T>(
        wellUid,
        wellboreUid,
        objectType,
        null,
        server
      )
    ),
  placeholderData: wrapPlaceholderData(options?.placeholderData),
  ...options,
  enabled:
    !!server &&
    !!wellUid &&
    !!wellboreUid &&
    !!objectType &&
    !(options?.enabled === false)
});

export const multipleObjectsQuery = <T extends ObjectType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T
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
  }
});

type ObjectsQueryResult<T extends ObjectType> = Omit<
  QueryObserverResult<TimedResponse<ObjectTypeToModel[T][]>, unknown>,
  "data"
> & {
  objects: ObjectTypeToModel[T][];
  responseTime: number;
};

export const useGetObjects = <T extends ObjectType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T,
  options?: QueryOptions
): ObjectsQueryResult<T> => {
  const { data, ...state } = useQuery<TimedResponse<ObjectTypeToModel[T][]>>(
    objectsQuery<T>(server, wellUid, wellboreUid, objectType, options)
  );
  return { objects: data?.data, responseTime: data?.responseTime, ...state };
};

//todo: fix types
export const useGetMultipleObjects = <T extends ObjectType>(
  wellComplexIds: { server: Server; wellId: string; wellboreId: string }[],
  objectType: T
): { objects: ObjectTypeToModel[T][]; isFetching: boolean }[] => {
  const result = useQueries<ObjectTypeToModel[T][][]>({
    queries: wellComplexIds?.map(({ server, wellId, wellboreId }) =>
      multipleObjectsQuery<T>(server, wellId, wellboreId, objectType)
    )
  });
  return result.map((r) => {
    return {
      objects: r.data as ObjectTypeToModel[T][],
      isFetching: r.isFetching
    };
  });
};
