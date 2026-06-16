import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { ObjectType, ObjectTypeToModel } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import { QUERY_KEY_OBJECT } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import {
  TimedResponse,
  withQueryTiming,
  wrapPlaceholderData
} from "./queryTiming";

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

export const objectQuery = <T extends ObjectType>(
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
  queryFn: () =>
    withQueryTiming(async () => {
      const object = await ObjectService.getObject<T>(
        wellUid,
        wellboreUid,
        objectUid,
        objectType,
        null,
        server
      );
      return object;
    }),

  ...options,
  placeholderData: wrapPlaceholderData(options?.placeholderData),
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
  QueryObserverResult<TimedResponse<ObjectTypeToModel[T]>, unknown>,
  "data"
> & {
  object: ObjectTypeToModel[T];
  responseTime: number;
};

export const useGetObject = <T extends ObjectType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T,
  objectUid: string,
  options?: QueryOptions
): ObjectQueryResult<T> => {
  const { data, ...state } = useQuery<TimedResponse<ObjectTypeToModel[T]>>(
    objectQuery<T>(server, wellUid, wellboreUid, objectType, objectUid, options)
  );
  return { object: data?.data, responseTime: data?.responseTime, ...state };
};
