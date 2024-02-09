import { useEffect, useState } from "react";
import { ComponentType } from "../models/componentType";
import ComponentService from "../services/componentService";

// TODO: Implement React Query for this hook, and move the file to query.
export function useGetObjectComponents<T>(
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  componentType: ComponentType
): [T[], boolean] {
  const [components, setComponents] = useState<T[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    setIsFetching(true);
    // TODO: abort signal needed?
    // const abortController = new AbortController();
    const getComponents = async () => {
      const objectComponents = (await ComponentService.getComponents(
        wellUid,
        wellboreUid,
        objectUid,
        componentType,
        undefined
        // abortController.signal
      )) as T[];
      setComponents(objectComponents);
      setIsFetching(false);
    };
    getComponents();
    // return function cleanup() {
    //   abortController.abort();
    // };
  }, [wellUid, wellboreUid, objectUid]);

  return [components, isFetching];
}
