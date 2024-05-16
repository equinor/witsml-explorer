import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getServer, renderWithContexts } from "__testUtils__/testUtils";
import ContextMenuPresenter from "components/ContextMenus/ContextMenuPresenter";
import SearchFilter from "components/Sidebar/SearchFilter";
import { EMPTY_FILTER, FilterContext, ObjectFilterType } from "contexts/filter";
import { vi } from "vitest";

vi.mock("services/objectService");

describe("Search Filter", () => {
  it("A search filter should show a searchable field", () => {
    renderWithContexts(<SearchFilter />);
    expect(
      screen.getByRole("textbox", { name: /search/i })
    ).toBeInTheDocument();
  });

  it("Typing in the field should update the text", async () => {
    const newName = "testWell123";
    const user = userEvent.setup();

    renderWithContexts(<SearchFilter />);
    const input = screen.getByRole("textbox", { name: /search/i });

    await user.type(input, newName);

    expect(input).toHaveValue(newName);
  });

  it("Typing in the field should update the filter", async () => {
    const newName = "testWell123";
    const user = userEvent.setup();
    const mockUpdateFilter = vi.fn();

    renderWithContexts(
      <FilterContext.Provider
        value={{
          selectedFilter: EMPTY_FILTER,
          updateSelectedFilter: mockUpdateFilter
        }}
      >
        <SearchFilter />
      </FilterContext.Provider>
    );

    await user.type(screen.getByRole("textbox", { name: /search/i }), newName);

    await waitFor(() => {
      expect(mockUpdateFilter).toHaveBeenCalledTimes(1);
    });
  });

  it("Should render the name provided by the context", async () => {
    const initialName = "testWell321";

    renderWithContexts(<SearchFilter />, {
      initialFilter: { name: initialName }
    });

    expect(screen.getByRole("textbox", { name: /search/i })).toHaveValue(
      initialName
    );
  });

  it("Should be able to show the search options", async () => {
    const user = userEvent.setup();

    renderWithContexts(
      <>
        <SearchFilter />
        <ContextMenuPresenter />
      </>,
      {
        initialConnectedServer: getServer()
      }
    );

    const showOptions = screen.getByRole("button", {
      name: /show search options/i
    });
    expect(showOptions).toBeEnabled();

    await user.click(showOptions);

    const menu = screen.getByRole("menu");

    expect(menu).toBeInTheDocument();

    expect(within(menu).getByText(/wells$/i)).toBeInTheDocument();
    expect(within(menu).getByText(/fields/i)).toBeInTheDocument();
    expect(within(menu).getByText(/licenses/i)).toBeInTheDocument();
    expect(within(menu).getByText(/rigs/i)).toBeInTheDocument();
    expect(within(menu).getByText(/service companies/i)).toBeInTheDocument();
  });

  it("Should show an icon with a tooltip with extra information for Service Companies", async () => {
    const user = userEvent.setup();

    renderWithContexts(
      <>
        <SearchFilter />
        <ContextMenuPresenter />
      </>,
      {
        initialConnectedServer: getServer()
      }
    );

    await user.click(
      screen.getByRole("button", { name: /show search options/i })
    );
    const serviceCompaniesMenuItem = screen.getByRole("menuitem", {
      name: /service companies/i
    });
    const infoIcon = within(serviceCompaniesMenuItem).getByTestId(
      `${ObjectFilterType.ServiceCompany}-info-icon`
    );

    expect(infoIcon).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.hover(infoIcon);
    const tooltip = await screen.findByRole("tooltip");

    expect(tooltip).toBeInTheDocument();
    expect(typeof tooltip.textContent).toBe("string");
  });
});
