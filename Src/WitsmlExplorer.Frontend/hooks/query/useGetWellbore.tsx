import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { useAuthorizationState } from "../../contexts/authorizationStateContext";
import { Server } from "../../models/server";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { AuthorizationStatus } from "../../services/authorizationService";
import { wellsQuery } from "./useGetWells";

type WellboreQueryResult = Omit<
  QueryObserverResult<Wellbore, unknown>,
  "data"
> & {
  wellbore: Wellbore;
};

export const useGetWellbore = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  abortSignal: AbortSignal = null
): WellboreQueryResult => {
  const { authorizationState } = useAuthorizationState();
  const { data, ...state } = useQuery<Well[], unknown, Wellbore>({
    ...wellsQuery(server, abortSignal),
    select: (data) =>
      data
        .find((well) => well.uid === wellUid)
        ?.wellbores.find((wellbore) => wellbore.uid === wellboreUid),
    enabled:
      !!server && authorizationState?.status === AuthorizationStatus.Authorized
  });
  return { wellbore: data, ...state };
};
