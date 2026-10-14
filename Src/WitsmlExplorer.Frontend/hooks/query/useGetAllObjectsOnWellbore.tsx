import { useQuery } from "@tanstack/react-query";
import SelectableObjectOnWellbore from "models/selectableObjectOnWellbore";
import { WitsmlProtocol } from "services/authorizationService";
import ObjectService from "services/objectService";
import { ProtocolAwareResponse } from "services/protocolAwareResponse";
import { Server } from "../../models/server";
import { QUERY_KEY_ALL_OBJECTS_ON_WELLBORE } from "./queryKeys";
import { QueryOptions } from "./queryOptions";

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
  placeholderData:
    options?.placeholderData == null
      ? undefined
      : ({
          data: options?.placeholderData,
          usedProtocol: undefined
        } as ProtocolAwareResponse<SelectableObjectOnWellbore[]>),
  enabled:
    !!server && !!wellUid && !!wellboreUid && !(options?.enabled === false)
});

type ObjectsOnWellboreQueryResult = {
  objectsOnWellbore: SelectableObjectOnWellbore[];
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  dataUpdatedAt: number;
  usedProtocol?: WitsmlProtocol;
};

export const useGetAllObjectsOnWellbore = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
): ObjectsOnWellboreQueryResult => {
  const { data, ...state } = useQuery<
    ProtocolAwareResponse<SelectableObjectOnWellbore[]>
  >(mixedObjectsReferenceQuery(server, wellUid, wellboreUid, options));
  return {
    objectsOnWellbore: data?.data ?? [],
    usedProtocol: data?.usedProtocol,
    ...state
  };
};
