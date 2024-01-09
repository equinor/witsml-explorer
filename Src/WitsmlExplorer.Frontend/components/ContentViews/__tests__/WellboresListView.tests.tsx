import { renderWithContexts } from "__testUtils__/testUtils";
import WellboresListView from "components/ContentViews/WellboresListView";

test("Should render when selected well is not set", () => {
  const component = renderWithContexts(<WellboresListView />);
  expect(component.baseElement).toMatchSnapshot();
});
