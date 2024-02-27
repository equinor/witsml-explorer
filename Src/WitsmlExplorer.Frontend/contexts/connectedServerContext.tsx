import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState
} from "react";
import { Server } from "../models/server";

interface ConnectedServerContextType {
  connectedServer: Server;
  setConnectedServer: Dispatch<SetStateAction<Server>>;
}

const ConnectedServerContext = createContext<ConnectedServerContextType>(null);

interface ConnectedServerProviderProps {
  children: ReactNode;
  initialConnectedServer?: Server;
}

export function ConnectedServerProvider({
  children,
  initialConnectedServer
}: ConnectedServerProviderProps) {
  const [connectedServer, setConnectedServer] = useState(
    initialConnectedServer
  );

  return (
    <ConnectedServerContext.Provider
      value={{ connectedServer, setConnectedServer }}
    >
      {children}
    </ConnectedServerContext.Provider>
  );
}

export function useConnectedServer() {
  const context = useContext(ConnectedServerContext);
  if (!context)
    throw new Error(
      `useConnectedServer() has to be used within <ConnectedServerProvider>`
    );
  return context;
}
