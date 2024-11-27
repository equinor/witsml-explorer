import { QueryObserverResult } from "@tanstack/react-query";
import { Server } from "../../models/server";
import Well from "../../models/well";
import { QueryOptions } from "./queryOptions";
import { useGetWells } from "./useGetWells";

type WellQueryResult = Omit<
  QueryObserverResult<Well, unknown>,
  "data" | "refetch"
> & {
  well: Well | undefined;
};

export const useGetWell = (
  server: Server,
  wellUid: string,
  options?: QueryOptions
): WellQueryResult => {
  const { wells, ...state } = useGetWells(server, options);
  const well = wells?.find((w) => w.uid === wellUid);
  return { well, ...state };
};
