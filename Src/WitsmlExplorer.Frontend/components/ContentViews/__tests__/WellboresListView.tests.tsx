import {
  MockResizeObserver,
  renderWithContexts
} from "../../../__testUtils__/testUtils";
import WellboresListView from "../WellboresListView";

test("Should render when selected well is not set", () => {
  //mock ResizeObserver to enable testing virtualized components
  window.ResizeObserver = MockResizeObserver;
  const component = renderWithContexts(<WellboresListView />);
  expect(component.baseElement).toMatchSnapshot();
});
