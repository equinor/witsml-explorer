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
import Well from "../models/well";
import Wellbore from "../models/wellbore";
import ObjectService from "../services/objectService";

export interface WellboreItemContextType {
  well: Well;
  wellbore: Wellbore;
  objectCount: Partial<Record<ObjectType, number>>;
}

export const WellboreItemContext = createContext<WellboreItemContextType>(null);

interface WellboreItemProviderProps {
  well: Well;
  wellbore: Wellbore;
  children: ReactNode;
  setIsFetchingCount: Dispatch<SetStateAction<boolean>>;
}

export function WellboreItemProvider({
  well,
  wellbore,
  children,
  setIsFetchingCount
}: WellboreItemProviderProps) {
  const [objectCount, setObjectCount] =
    useState<Partial<Record<ObjectType, number>>>(null);

  useEffect(() => {
    const fetchObjectCount = async () => {
      setIsFetchingCount(true);
      const objectCount = await ObjectService.getExpandableObjectsCount(
        wellbore
      );
      setObjectCount(objectCount);
      setIsFetchingCount(false);
    };
    fetchObjectCount();
  }, [wellbore]);

  return (
    <WellboreItemContext.Provider value={{ well, wellbore, objectCount }}>
      {children}
    </WellboreItemContext.Provider>
  );
}

export function useWellboreItem() {
  const context = useContext(WellboreItemContext);
  if (!context)
    throw new Error(
      `useWellboreItem() has to be used within <SidebarProvider>`
    );
  return context;
}
