import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { Server } from "../../models/server";
import ServerService from "../../services/serverService";
import { QUERY_KEY_SERVERS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";

export const getServersQueryKey = () => {
  return [QUERY_KEY_SERVERS];
};

export const serversQuery = (options?: QueryOptions) => ({
  queryKey: getServersQueryKey(),
  queryFn: async () => {
    const servers = await ServerService.getServers();
    return servers;
  },
  ...options
});

type ServersQueryResult = Omit<
  QueryObserverResult<Server[], unknown>,
  "data"
> & {
  servers: Server[];
};

export const useGetServers = (options?: QueryOptions): ServersQueryResult => {
  const { data, ...state } = useQuery<Server[]>(serversQuery(options));
  return { servers: data, ...state };
};
