import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { Server } from "../../models/server";
import Well from "../../models/well";
import { AuthorizationStatus } from "../../services/authorizationService";
import { wellsQuery } from "./useGetWells";

type WellQueryResult = Omit<QueryObserverResult<Well, unknown>, "data"> & {
  well: Well;
};

export const useGetWell = (
  server: Server,
  wellUid: string,
  abortSignal: AbortSignal = null
): WellQueryResult => {
  const { authorizationState } = useAuthorizationState();
  const { data, ...state } = useQuery<Well[], unknown, Well>({
    ...wellsQuery(server, abortSignal),
    select: (data) => data.find((well) => well.uid === wellUid),
    enabled:
      !!server && authorizationState?.status === AuthorizationStatus.Authorized
  });
  return { well: data, ...state };
};
