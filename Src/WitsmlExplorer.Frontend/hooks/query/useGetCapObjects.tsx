import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import {
  MILLIS_IN_SECOND,
  SECONDS_IN_MINUTE
} from "../../components/Constants";
import { ObjectType } from "../../models/objectType";
import { Server } from "../../models/server";
import CapService from "../../services/capService";
import { QUERY_KEY_CAP_OBJECTS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";

export const getCapObjectsQueryKey = (serverUrl: string) => {
  return [QUERY_KEY_CAP_OBJECTS, serverUrl?.toLowerCase()];
};

export const capObjectsQuery = (server: Server, options?: QueryOptions) => ({
  queryKey: getCapObjectsQueryKey(server?.url),
  queryFn: async () => {
    return getCapObjects(server);
  },
  ...options,
  enabled: !!server && !(options?.enabled === false),
  gcTime: 12 * SECONDS_IN_MINUTE * MILLIS_IN_SECOND // capObjects won't change, so we can cache it for a long time.
});

type CapObjectsQueryResult = Omit<
  QueryObserverResult<ObjectType[], unknown>,
  "data"
> & {
  capObjects: ObjectType[];
};

export const useGetCapObjects = (
  server: Server,
  options?: QueryOptions
): CapObjectsQueryResult => {
  const { data, ...state } = useQuery<ObjectType[]>(
    capObjectsQuery(server, options)
  );
  return { capObjects: data, ...state };
};

const getCapObjects = async (server: Server): Promise<ObjectType[]> => {
  const objects = await CapService.getCapObjects(undefined, undefined, server);

  const capObjects = Object.values(ObjectType).filter((objectType) =>
    objects.map((o) => o.toLowerCase()).includes(objectType.toLowerCase())
  );

  return capObjects;
};
