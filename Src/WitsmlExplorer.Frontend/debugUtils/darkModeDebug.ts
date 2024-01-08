import { DispatchOperation } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { dark, light } from "styles/Colors";

let mode = "light";

export const enableDarkModeDebug = (dispatchOperation: DispatchOperation) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.shiftKey && e.code == "Tab") {
      let selectedMode;
      if (mode == "light") {
        selectedMode = dark;
        mode = "dark";
      } else {
        selectedMode = light;
        mode = "light";
      }
      dispatchOperation({ type: OperationType.SetMode, payload: selectedMode });
      e.preventDefault();
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return function cleanup() {
    document.removeEventListener("keydown", handleKeyDown);
  };
};
