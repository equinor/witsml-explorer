import { createContext } from "react";
import { NavigationAction, NavigationState } from "./navigationStateReducer";

interface NavigationContextProps {
  navigationState: NavigationState;
  dispatchNavigation: (action: NavigationAction) => void;
}

const NavigationContext = createContext<NavigationContextProps>({} as NavigationContextProps);

export default NavigationContext;
