import { useQuery } from "@tanstack/react-query";
import { WitsmlProtocol } from "services/authorizationService";
import { ProtocolAwareResponse } from "services/protocolAwareResponse";
import {
  ComponentType,
  ComponentTypeToModel,
  getParentType
} from "../../models/componentType";
import { Server } from "../../models/server";
import ComponentService from "../../services/componentService";
import { QUERY_KEY_COMPONENTS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";
import { TimedResponse, withQueryTiming } from "./queryTiming";

export const getComponentsQueryKey = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  componentType: ComponentType
) => {
  return [
    QUERY_KEY_COMPONENTS,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase(),
    wellboreUid?.toLowerCase(),
    getParentType(componentType)?.toLowerCase(), // The object type of the parent object.
    objectUid?.toLowerCase(),
    componentType?.toLowerCase()
  ];
};

export const componentsQuery = <T extends ComponentType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  componentType: T,
  options?: QueryOptions
) => ({
  queryKey: getComponentsQueryKey(
    server?.url,
    wellUid,
    wellboreUid,
    objectUid,
    componentType
  ),

  queryFn: () =>
    withQueryTiming(async () => {
      const componentsResult = await ComponentService.getComponents<T>(
        wellUid,
        wellboreUid,
        objectUid,
        componentType,
        server
      );
      return componentsResult;
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
        } as TimedResponse<ProtocolAwareResponse<ComponentTypeToModel[T][]>>),
  gcTime: 0,
  enabled:
    !!server &&
    !!wellUid &&
    !!wellboreUid &&
    !!objectUid &&
    !!componentType &&
    !(options?.enabled === false)
});

type ObjectComponentsQueryResult<T extends ComponentType> = {
  components: ComponentTypeToModel[T][];
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isFetched: boolean;
  dataUpdatedAt: number;
  responseTime: number;
  usedProtocol?: WitsmlProtocol;
};

export const useGetComponents = <T extends ComponentType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  componentType: T,
  options?: QueryOptions
): ObjectComponentsQueryResult<T> => {
  const { data: timedResult, ...state } = useQuery<
    TimedResponse<ProtocolAwareResponse<ComponentTypeToModel[T][]>>
  >(
    componentsQuery<T>(
      server,
      wellUid,
      wellboreUid,
      objectUid,
      componentType,
      options
    )
  );
  const protocolAwareResult = timedResult?.data;
  const components = protocolAwareResult?.data;

  return {
    components: components ?? [],
    responseTime: timedResult?.responseTime,
    usedProtocol: protocolAwareResult?.usedProtocol,
    ...state
  };
};
