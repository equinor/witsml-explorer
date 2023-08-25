import { render } from "@testing-library/react";
import { FilterContextProvider } from "../../../contexts/filter";
import NavigationContext from "../../../contexts/navigationContext";
import { initNavigationStateReducer } from "../../../contexts/navigationStateReducer";
import OperationContext from "../../../contexts/operationContext";
import { initOperationStateReducer } from "../../../contexts/operationStateReducer";
import WellboresListView from "../WellboresListView";

test("Should render when selected well is not set", () => {
  const TestComponent = () => {
    const [navigationState, dispatchNavigation] = initNavigationStateReducer();
    const [operationState, dispatchOperation] = initOperationStateReducer();
    return (
      <OperationContext.Provider value={{ operationState, dispatchOperation }}>
        <NavigationContext.Provider value={{ navigationState, dispatchNavigation }}>
          <FilterContextProvider>
            <WellboresListView />
          </FilterContextProvider>
        </NavigationContext.Provider>
      </OperationContext.Provider>
    );
  };

  const component = render(<TestComponent />);
  expect(component.baseElement).toMatchSnapshot();
});
