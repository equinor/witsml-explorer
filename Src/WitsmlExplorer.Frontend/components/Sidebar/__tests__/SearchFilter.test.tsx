import "@testing-library/jest-dom/extend-expect";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  deferred,
  getObjectSearchResult,
  getServer,
  renderWithContexts
} from "__testUtils__/testUtils";
import ContextMenuPresenter from "components/ContextMenus/ContextMenuPresenter";
import SearchFilter from "components/Sidebar/SearchFilter";
import { EMPTY_FILTER, FilterContext, ObjectFilterType } from "contexts/filter";
import ObjectSearchResult from "models/objectSearchResult";
import ObjectService from "services/objectService";

jest.mock("services/objectService");

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
    const mockUpdateFilter = jest.fn();

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
      { initialNavigationState: { selectedServer: getServer() } }
    );

    const showOptions = screen.getByRole("button", {
      name: /show search options/i
    });
    expect(showOptions).toBeEnabled();

    await user.click(showOptions);

    const menu = screen.getByRole("menu");

    expect(menu).toBeInTheDocument();

    expect(within(menu).getByText(/wells$/i)).toBeInTheDocument();
    expect(within(menu).getByText(/wellbores/i)).toBeInTheDocument();
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
      { initialNavigationState: { selectedServer: getServer() } }
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
    expect(tooltip.textContent).toMatchInlineSnapshot(`
      "Service Companies will be fetched on demand by typing 'Enter' or clicking the search icon.
      Use wildcard ? for one unknown character.
      Use wildcard * for x unknown characters."
    `);
  });

  it("Options should be closed, and loading dots displayed while fetching an object", async () => {
    const { promise, resolve } = deferred<ObjectSearchResult[]>();
    const user = userEvent.setup();

    jest
      .spyOn(ObjectService, "getObjectsWithParamByType")
      .mockImplementation(() => promise);

    renderWithContexts(
      <>
        <SearchFilter />
        <ContextMenuPresenter />
      </>,
      { initialNavigationState: { selectedServer: getServer() } }
    );

    const showOptions = screen.getByRole("button", {
      name: /show search options/i
    });
    expect(showOptions).toBeEnabled();

    await user.click(showOptions);

    const menu = screen.getByRole("menu");

    await user.click(within(menu).getByText(/rigs/i));
    await user.type(
      screen.getByRole("textbox", { name: /search/i }),
      "testRig{enter}"
    );

    expect(
      screen.getByRole("progressbar", { name: /loading options/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(ObjectService.getObjectsWithParamByType).toHaveBeenCalledTimes(1);

    // Resolve and return from the mocked getObjectsWithParamByType
    await act(async () => {
      resolve(SEARCH_RESULT_RIGS);
    });

    expect(
      screen.queryByRole("progressbar", { name: /loading options/i })
    ).not.toBeInTheDocument();
  });
});

const SEARCH_RESULT_RIGS = [
  getObjectSearchResult({
    searchProperty: "testRig",
    wellUid: "well1",
    wellboreUid: "wellbore1"
  })
];
