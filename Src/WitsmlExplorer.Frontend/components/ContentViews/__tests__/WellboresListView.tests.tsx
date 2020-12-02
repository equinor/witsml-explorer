import React from "react";
import { mount } from "enzyme";
import WellboresListView from "../WellboresListView";
import NavigationContext from "../../../contexts/navigationContext";
import { initNavigationStateReducer } from "../../../contexts/navigationStateReducer";

test("Should render when selected well is not set", () => {
  const TestComponent = () => {
    const [navigationState, dispatchNavigation] = initNavigationStateReducer();
    return (
      <NavigationContext.Provider value={{ navigationState, dispatchNavigation }}>
        <WellboresListView />
      </NavigationContext.Provider>
    );
  };

  const component = mount(<TestComponent />);
  expect(component).toMatchSnapshot();
});
