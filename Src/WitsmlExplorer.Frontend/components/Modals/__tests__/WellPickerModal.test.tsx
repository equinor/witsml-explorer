import { screen } from "@testing-library/react";
import { mockEdsCoreReact } from "__testUtils__/mocks/EDSMocks";
import { MockResizeObserver, renderWithContexts } from "__testUtils__/testUtils";
import WellPickerModal from "components/Modals/WellPickerModal";
import Well from "models/well";
import { vi } from "vitest";

vi.mock("@equinor/eds-core-react", () => mockEdsCoreReact());

const MOCK_WELL: Well = {
  uid: "well-1",
  name: "Well 1",
  field: "Field 1",
  operator: "Operator 1",
  country: "Norway",
  timeZone: "+01:00"
};

describe("WellPickerModal", () => {
  beforeAll(() => {
    window.ResizeObserver = MockResizeObserver;
  });

  it("Should render without throwing errors", () => {
    renderWithContexts(<WellPickerModal selectedWell={MOCK_WELL} />);
    expect(screen.getByText("Compare well with")).toBeInTheDocument();
    expect(screen.getByText(/Source Well/)).toBeInTheDocument();
  });
});
