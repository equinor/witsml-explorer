import {
  QueryTemplatePreset,
  ReturnElements,
  StoreFunction,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import {
  QueryActionType,
  QueryState,
  queryReducer
} from "contexts/queryContext";
import { v4 as uuid } from "uuid";
import { vi } from "vitest";

vi.mock("templates/templates", () => ({
  templates: {
    log: `
<logs xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <log uidWell="" uidWellbore="" uid="">
  </log>
</logs>
`
  }
}));

describe("QueryContext Reducer", () => {
  it("Should update query", () => {
    const initialState = getInitialState(1);
    const action = { type: QueryActionType.SetQuery, query: WELL_QUERY };
    const newState = queryReducer(initialState, action);
    const queryElement = newState.queries[0];
    expect(queryElement.query).toEqual(WELL_QUERY);
  });

  it("Should update result", () => {
    const initialState = getInitialState(1);
    const action = { type: QueryActionType.SetResult, result: WELL_QUERY };
    const newState = queryReducer(initialState, action);
    const queryElement = newState.queries[0];
    expect(queryElement.result).toEqual(WELL_QUERY);
  });

  it("Should update store function", () => {
    const initialState = getInitialState(1);
    const action = {
      type: QueryActionType.SetStoreFunction,
      storeFunction: StoreFunction.UpdateInStore
    };
    const newState = queryReducer(initialState, action);
    const queryElement = newState.queries[0];
    expect(queryElement.storeFunction).toEqual(StoreFunction.UpdateInStore);
  });

  it("Should update return elements", () => {
    const initialState = getInitialState(1);
    const action = {
      type: QueryActionType.SetReturnElements,
      returnElements: ReturnElements.HeaderOnly
    };
    const newState = queryReducer(initialState, action);
    const queryElement = newState.queries[0];
    expect(queryElement.returnElements).toEqual(ReturnElements.HeaderOnly);
  });

  it("Should update options in", () => {
    const initialState = getInitialState(1);
    const action = {
      type: QueryActionType.SetOptionsIn,
      optionsIn: "cascadedDelete=true"
    };
    const newState = queryReducer(initialState, action);
    const queryElement = newState.queries[0];
    expect(queryElement.optionsIn).toEqual("cascadedDelete=true");
  });

  it("Should update from template preset", () => {
    const initialState = getInitialState(1);
    const templatePreset: QueryTemplatePreset = {
      templateObject: TemplateObjects.Log,
      storeFunction: StoreFunction.AddToStore,
      returnElements: ReturnElements.All,
      optionsIn: "option=false",
      wellUid: "wellUid",
      wellboreUid: "wellboreUid",
      objectUid: "objectUid"
    };
    const action = {
      type: QueryActionType.SetFromTemplatePreset,
      templatePreset
    };
    const newState = queryReducer(initialState, action);
    const queryElement = newState.queries[0];
    const expectedQuery = getExpectedLogQuery(
      templatePreset.wellUid,
      templatePreset.wellboreUid,
      templatePreset.objectUid
    );
    expect(queryElement.query).toEqual(expectedQuery);
    expect(queryElement.storeFunction).toEqual(templatePreset.storeFunction);
    expect(queryElement.returnElements).toEqual(templatePreset.returnElements);
    expect(queryElement.optionsIn).toEqual(templatePreset.optionsIn);
  });

  it("Should update tab index", () => {
    const initialState = getInitialState(2);
    const action = { type: QueryActionType.SetTabIndex, tabIndex: 1 };
    const newState = queryReducer(initialState, action);
    expect(newState.tabIndex).toEqual(1);
  });

  it("Should add tab and select the second tab", () => {
    const initialState = getInitialState(1);
    const action = { type: QueryActionType.AddTab };
    const newState = queryReducer(initialState, action);
    expect(newState.queries.length).toEqual(2);
    expect(newState.tabIndex).toEqual(1);
  });

  it("Should remove tab and select the first tab", () => {
    const initialState = getInitialState(2);
    const action = {
      type: QueryActionType.RemoveTab,
      tabId: initialState.queries[1].tabId
    };
    const newState = queryReducer(initialState, action);
    expect(newState.queries.length).toEqual(1);
    expect(newState.tabIndex).toEqual(0);
  });
});

const getInitialState = (numberOfQueries: number): QueryState => ({
  queries: Array(numberOfQueries)
    .fill({})
    .map(() => ({
      query: "",
      result: "",
      storeFunction: StoreFunction.GetFromStore,
      returnElements: ReturnElements.All,
      optionsIn: "",
      tabId: uuid()
    })),
  tabIndex: numberOfQueries - 1
});

const WELL_QUERY = `
<wells xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <well uid="">
  </well>
</wells>`;

const getExpectedLogQuery = (
  wellUid: string,
  wellboreUid: string,
  logUid: string
) => `
<logs xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <log uidWell="${wellUid}" uidWellbore="${wellboreUid}" uid="${logUid}">
  </log>
</logs>
`;
