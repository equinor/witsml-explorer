import { QueryClient } from "@tanstack/react-query";
import {
  QUERY_KEY_WELL,
  QUERY_KEY_WELLBORE,
  QUERY_KEY_WELLBORES,
  QUERY_KEY_WELLS
} from "./queryKeys";

export const refreshWellsQuery = (
  queryClient: QueryClient,
  serverUrl: string
) => {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_WELLS, serverUrl.toLowerCase()]
  });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_WELLBORES, serverUrl.toLowerCase()]
  });
  // TODO: Invalidate all queries of objects that are "children" of wells.
};

export const refreshWellQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_WELL, serverUrl.toLowerCase(), wellUid.toLowerCase()]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_WELLBORES,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase()
    ]
  });
  // TODO: Invalidate all queries of objects that are "children" of the well.
};

export const refreshWellboresQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_WELLBORES,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase()
    ]
  });
  // TODO: Invalidate all queries of objects that are "children" of wellbores.
};

export const refreshWellboreQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_WELLBORE,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase()
    ]
  });
  // TODO: Invalidate all queries of objects that are "children" of the wellbore.
};
