import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import {
  LoggedInUsername,
  useLoggedInUsernames
} from "contexts/loggedInUsernamesContext";
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
  const { loggedInUsernames } = useLoggedInUsernames();

  // This step is necessary because the currentUsername is lost during server refresh.
  data?.map((server) => setCurrentUsernames(server, loggedInUsernames));

  return { servers: data, ...state };
};

/**
 * The following method is used to set the currentUsername on the server object.
 * It's worth noting that changing objects using their reference is generally considered bad practice.
 * However, since the AuthorizationService is already modifying the server object in this way, this method has been designed to do the same.
 * @param server
 * @param loggedInUsernames
 */
const setCurrentUsernames = (
  server: Server,
  loggedInUsernames: LoggedInUsername[]
) => {
  loggedInUsernames.map((loggedInUsername) => {
    if (server.id === loggedInUsername.serverId) {
      server.currentUsername = loggedInUsername.username;
    }
  });
};
