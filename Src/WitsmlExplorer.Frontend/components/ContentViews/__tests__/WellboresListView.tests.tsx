import { render } from "@testing-library/react";
import NavigationContext from "../../../contexts/navigationContext";
import { initNavigationStateReducer } from "../../../contexts/navigationStateReducer";
import WellboresListView from "../WellboresListView";

test("Should render when selected well is not set", () => {
  const TestComponent = () => {
    const [navigationState, dispatchNavigation] = initNavigationStateReducer();
    return (
      <NavigationContext.Provider value={{ navigationState, dispatchNavigation }}>
        <WellboresListView />
      </NavigationContext.Provider>
    );
  };

  const component = render(<TestComponent />);
  expect(component.baseElement).toMatchSnapshot();
});
