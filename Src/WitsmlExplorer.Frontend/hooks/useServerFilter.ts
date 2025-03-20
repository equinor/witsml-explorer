import { Server } from "models/server";
import { useContext, useMemo } from "react";
import { Filter, FilterContext, getSearchRegex } from "../contexts/filter";

const filterServersByPriority = (servers: Server[]): Server[] => {
  return servers.filter((server) => server.isPriority);
};

const filterServersByName = (servers: Server[], filterByName: string) => {
  const searchRegex = getSearchRegex(filterByName);
  return servers.filter(
    (server) => searchRegex.test(server.name) || searchRegex.test(server.url)
  );
};

export const filterServers = (
  servers: Server[],
  filter: Filter,
  filterByName?: string
): Server[] => {
  let filteredServers: Server[] = servers;

  if ((filter || filterByName) && servers?.length > 0) {
    if (filter.filterPriorityServers) {
      filteredServers = filterServersByPriority(servers);
    }
    if (filterByName) {
      filteredServers = filterServersByName(servers, filterByName);
    }
  }

  return filteredServers;
};

export const useServerFilter = (
  servers: Server[],
  filterByName?: string
): Server[] => {
  const { selectedFilter } = useContext(FilterContext);

  const filteredServers = useMemo(() => {
    return filterServers(servers, selectedFilter, filterByName);
  }, [servers, selectedFilter.filterPriorityServers, filterByName]);

  return filteredServers;
};
