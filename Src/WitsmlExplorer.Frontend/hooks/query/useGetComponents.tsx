import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import {
  ComponentType,
  ComponentTypeToModel,
  getParentType
} from "../../models/componentType";
import { Server } from "../../models/server";
import ComponentService from "../../services/componentService";
import { QUERY_KEY_COMPONENTS } from "./queryKeys";
import { QueryOptions } from "./queryOptions";

export const getComponentsQueryKey = (
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  componentType: ComponentType
) => {
  return [
    QUERY_KEY_COMPONENTS,
    serverUrl?.toLowerCase(),
    wellUid?.toLowerCase(),
    wellboreUid?.toLowerCase(),
    getParentType(componentType)?.toLowerCase(), // The object type of the parent object.
    objectUid?.toLowerCase(),
    componentType?.toLowerCase()
  ];
};

export const componentsQuery = <T extends ComponentType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  componentType: T,
  options?: QueryOptions
) => ({
  queryKey: getComponentsQueryKey(
    server?.url,
    wellUid,
    wellboreUid,
    objectUid,
    componentType
  ),
  queryFn: async () => {
    const components = await ComponentService.getComponents<T>(
      wellUid,
      wellboreUid,
      objectUid,
      componentType,
      server
    );
    return components;
  },
  ...options,
  enabled:
    !!server &&
    !!wellUid &&
    !!wellboreUid &&
    !!objectUid &&
    !!componentType &&
    !(options?.enabled === false)
});

type ObjectComponentsQueryResult<T extends ComponentType> = Omit<
  QueryObserverResult<ComponentTypeToModel[T][], unknown>,
  "data"
> & {
  components: ComponentTypeToModel[T][];
};

export const useGetComponents = <T extends ComponentType>(
  server: Server,
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  componentType: T,
  options?: QueryOptions
): ObjectComponentsQueryResult<T> => {
  const { data, ...state } = useQuery<ComponentTypeToModel[T][]>(
    componentsQuery<T>(
      server,
      wellUid,
      wellboreUid,
      objectUid,
      componentType,
      options
    )
  );
  return { components: data, ...state };
};

// TODO: Implement React Query for this hook, and move the file to query.
// export function useGetObjectComponents<T>(
//   wellUid: string,
//   wellboreUid: string,
//   objectUid: string,
//   componentType: ComponentType
// ): [T[], boolean] {
//   const [components, setComponents] = useState<T[]>([]);
//   const [isFetching, setIsFetching] = useState<boolean>(true);

//   useEffect(() => {
//     setIsFetching(true);
//     // TODO: abort signal needed?
//     // const abortController = new AbortController();
//     const getComponents = async () => {
//       const objectComponents = (await ComponentService.getComponents(
//         wellUid,
//         wellboreUid,
//         objectUid,
//         componentType,
//         undefined
//         // abortController.signal
//       )) as T[];
//       setComponents(objectComponents);
//       setIsFetching(false);
//     };
//     getComponents();
//     // return function cleanup() {
//     //   abortController.abort();
//     // };
//   }, [wellUid, wellboreUid, objectUid]);

//   return [components, isFetching];
// }
