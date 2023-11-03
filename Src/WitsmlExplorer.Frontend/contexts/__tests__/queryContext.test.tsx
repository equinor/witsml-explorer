import { QueryTemplatePreset, ReturnElements, StoreFunction, TemplateObjects } from "../../components/ContentViews/QueryViewUtils";
import { QueryActionType, QueryContextState, queryContextReducer } from "../queryContext";

jest.mock("../../templates/templates", () => ({
  templates: {
    log: LOG_QUERY
  }
}));

describe("QueryContext Reducer", () => {
  it("Should update query", () => {
    const action = { type: QueryActionType.SetQuery, query: WELL_QUERY };
    const newState = queryContextReducer(INITIAL_STATE, action);
    expect(newState.query).toEqual(WELL_QUERY);
  });

  it("Should update store function", () => {
    const action = { type: QueryActionType.SetStoreFunction, storeFunction: StoreFunction.UpdateInStore };
    const newState = queryContextReducer(INITIAL_STATE, action);
    expect(newState.storeFunction).toEqual(StoreFunction.UpdateInStore);
  });

  it("Should update return elements", () => {
    const action = { type: QueryActionType.SetReturnElements, returnElements: ReturnElements.HeaderOnly };
    const newState = queryContextReducer(INITIAL_STATE, action);
    expect(newState.returnElements).toEqual(ReturnElements.HeaderOnly);
  });

  it("Should update options in", () => {
    const action = { type: QueryActionType.SetOptionsIn, optionsIn: "cascadedDelete=true" };
    const newState = queryContextReducer(INITIAL_STATE, action);
    expect(newState.optionsIn).toEqual("cascadedDelete=true");
  });

  it("Should update from template preset", () => {
    const templatePreset: QueryTemplatePreset = {
      templateObject: TemplateObjects.Log,
      storeFunction: StoreFunction.AddToStore,
      returnElements: ReturnElements.All,
      optionsIn: "option=false",
      wellUid: "wellUid",
      wellboreUid: "wellboreUid",
      objectUid: "objectUid"
    };
    const action = { type: QueryActionType.SetFromTemplatePreset, templatePreset };
    const newState = queryContextReducer(INITIAL_STATE, action);
    const expectedQuery = getExpectedLogQuery(templatePreset.wellUid, templatePreset.wellboreUid, templatePreset.objectUid);
    expect(newState.query).toEqual(expectedQuery);
    expect(newState.storeFunction).toEqual(templatePreset.storeFunction);
    expect(newState.returnElements).toEqual(templatePreset.returnElements);
    expect(newState.optionsIn).toEqual(templatePreset.optionsIn);
  });
});

const INITIAL_STATE: QueryContextState = {
  query: "",
  storeFunction: StoreFunction.GetFromStore,
  returnElements: ReturnElements.All,
  optionsIn: ""
};

const WELL_QUERY = `
<wells xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <well uid="">
  </well>
</wells>`;

const LOG_QUERY = `
<logs xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <log uidWell="" uidWellbore="" uid="">
  </log>
</logs>
`;

const getExpectedLogQuery = (wellUid: string, wellboreUid: string, logUid: string) => `
<logs xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
  <log uidWell="${wellUid}" uidWellbore="${wellboreUid}" uid="${logUid}">
  </log>
</logs>
`;
