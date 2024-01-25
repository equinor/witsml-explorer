import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState
} from "react";
import { Server } from "../models/server";

interface ServersContextType {
  servers: Server[];
  setServers: Dispatch<SetStateAction<Server[]>>;
}

const ServersContext = createContext<ServersContextType>(null);

interface ServersProviderProps {
  children: ReactNode;
}

export function ServersProvider({ children }: ServersProviderProps) {
  const [servers, setServers] = useState<Server[]>();

  return (
    <ServersContext.Provider value={{ servers, setServers }}>
      {children}
    </ServersContext.Provider>
  );
}

export function useServers() {
  const context = useContext(ServersContext);
  if (!context)
    throw new Error(`useServers() has to be used within <ServersProvider>`);
  return context;
}
