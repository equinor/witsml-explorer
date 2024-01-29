import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { ObjectType } from "../models/objectType";
import Wellbore, { getObjectsFromWellbore } from "../models/wellbore";
import ObjectService from "../services/objectService";

interface ObjectGroupItemContextType {
  groupObjects: any;
}

const ObjectGroupItemContext = createContext<ObjectGroupItemContextType>(null);

interface ObjectGroupItemProviderProps {
  wellbore: Wellbore;
  objectType: ObjectType;
  children: ReactNode;
  setParentGroupObjects: Dispatch<SetStateAction<any>>;
  setIsFetching: Dispatch<SetStateAction<boolean>>;
}

export function ObjectGroupItemProvider({
  wellbore,
  objectType,
  children,
  setParentGroupObjects,
  setIsFetching
}: ObjectGroupItemProviderProps) {
  const [groupObjects, setGroupObjects] = useState<any>(null);

  useEffect(() => {
    const fetchObjects = async () => {
      const objects = getObjectsFromWellbore(wellbore, objectType);
      if (objects == null || objects.length == 0) {
        setIsFetching(true);
        const fetchedObjects = await ObjectService.getObjects(
          wellbore.wellUid,
          wellbore.uid,
          objectType
        );
        setGroupObjects(fetchedObjects);
        setParentGroupObjects(fetchedObjects);
        setIsFetching(false);
      }
    };
    fetchObjects();
  }, [wellbore]);

  return (
    <ObjectGroupItemContext.Provider value={{ groupObjects }}>
      {children}
    </ObjectGroupItemContext.Provider>
  );
}

export function useObjectGroupItem() {
  const context = useContext(ObjectGroupItemContext);
  if (!context)
    throw new Error(
      `useObjectGroupItem() has to be used within <ObjectGroupItemProvider>`
    );
  return context;
}
