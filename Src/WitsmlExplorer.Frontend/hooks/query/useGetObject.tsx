import { useQuery } from "@tanstack/react-query";
import { WitsmlProtocol } from "services/authorizationService";
import { ProtocolAwareResponse } from "services/protocolAwareResponse";
import { ObjectType, ObjectTypeToModel } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import { QUERY_KEY_OBJECT } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./queryTiming";

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
  placeholderData:
    options?.placeholderData == null
      ? undefined
      : ({
          data: {
            data: options?.placeholderData,
            usedProtocol: undefined
          },
          responseTime: 0
        } as TimedResponse<ProtocolAwareResponse<ObjectTypeToModel[T]>>),
  gcTime: 0,
  enabled:
    !!server &&
    !!wellUid &&
    !!wellboreUid &&
    !!objectType &&
    !!objectUid &&
    !(options?.enabled === false)
});

type ObjectQueryResult<T extends ObjectType> = {
  object: ObjectTypeToModel[T];
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isFetched: boolean;
  dataUpdatedAt: number;
  responseTime: number;
  usedProtocol?: WitsmlProtocol;
};

export const useGetObject = <T extends ObjectType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T,
  objectUid: string,
  options?: QueryOptions
): ObjectQueryResult<T> => {
  const { data: timedResult, ...state } = useQuery<
    TimedResponse<ProtocolAwareResponse<ObjectTypeToModel[T]>>
  >(
    objectQuery<T>(server, wellUid, wellboreUid, objectType, objectUid, options)
  );

  const protocolAwareResult = timedResult?.data;

  return {
    object: protocolAwareResult?.data,
    responseTime: timedResult?.responseTime,
    usedProtocol: protocolAwareResult?.usedProtocol,
    ...state
  };
};
