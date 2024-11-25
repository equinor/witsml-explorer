import { QueryObserverResult } from "@tanstack/react-query";
import { Server } from "../../models/server";
import Wellbore from "../../models/wellbore";
import { QueryOptions } from "./queryOptions";
import { useGetWellbores } from "./useGetWellbores";

type WellboreQueryResult = Omit<
  QueryObserverResult<Wellbore, unknown>,
  "data" | "refetch"
> & {
  wellbore: Wellbore;
};

export const useGetWellbore = (
  server: Server,
  wellUid: string,
  wellboreUid: string,
  options?: QueryOptions
): WellboreQueryResult => {
  const { wellbores, ...state } = useGetWellbores(server, wellUid, options);
  const wellbore = wellbores?.find(
    (w) => w.uid === wellboreUid && w.wellUid === wellUid
  );
  return { wellbore, ...state };
};
