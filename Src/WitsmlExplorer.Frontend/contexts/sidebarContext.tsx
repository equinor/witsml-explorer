import { ReactNode, createContext, useContext, useReducer } from "react";
import { SidebarAction, sidebarReducer } from "./sidebarReducer";

interface SidebarContextType {
  expandedTreeNodes: string[];
  dispatchSidebar: (action: SidebarAction) => void;
}

const SidebarContext = createContext<SidebarContextType>(null);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [expandedTreeNodes, dispatchSidebar] = useReducer(sidebarReducer, []);

  return (
    <SidebarContext.Provider value={{ expandedTreeNodes, dispatchSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error(`useSidebar() has to be used within <SidebarProvider>`);
  return context;
}
