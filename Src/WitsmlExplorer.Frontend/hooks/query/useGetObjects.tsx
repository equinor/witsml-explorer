import { useQuery } from "@tanstack/react-query";
import { WitsmlProtocol } from "services/authorizationService";
import { ProtocolAwareResponse } from "services/protocolAwareResponse";
import { ObjectType, ObjectTypeToModel } from "../../models/objectType";
import { Server } from "../../models/server";
import ObjectService from "../../services/objectService";
import { QUERY_KEY_OBJECTS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./queryTiming";

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
    withQueryTiming(
      async () =>
        await ObjectService.getObjects<T>(
          wellUid,
          wellboreUid,
          objectType,
          null,
          server
        )
    ),
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
        } as TimedResponse<ProtocolAwareResponse<ObjectTypeToModel[T][]>>),
  enabled:
    !!server &&
    !!wellUid &&
    !!wellboreUid &&
    !!objectType &&
    !(options?.enabled === false)
});

type ObjectsQueryResult<T extends ObjectType> = {
  objects: ObjectTypeToModel[T][];
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isFetched: boolean;
  dataUpdatedAt: number;
  responseTime: number;
  usedProtocol?: WitsmlProtocol;
};

export const useGetObjects = <T extends ObjectType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectType: T,
  options?: QueryOptions
): ObjectsQueryResult<T> => {
  const { data: timedResult, ...state } = useQuery<
    TimedResponse<ProtocolAwareResponse<ObjectTypeToModel[T][]>>
  >(objectsQuery<T>(server, wellUid, wellboreUid, objectType, options));

  const protocolAwareResult = timedResult?.data;
  return {
    objects: protocolAwareResult?.data ?? [],
    responseTime: timedResult?.responseTime,
    usedProtocol: protocolAwareResult?.usedProtocol,
    ...state
  };
};
