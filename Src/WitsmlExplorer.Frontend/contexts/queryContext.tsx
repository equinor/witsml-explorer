import React, { Dispatch, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { STORAGE_QUERYVIEW_DATA } from "../components/Constants";
import { QueryTemplatePreset, ReturnElements, StoreFunction, getQueryTemplateWithPreset } from "../components/ContentViews/QueryViewUtils";

export interface QueryContextElement {
  query: string;
  result: string;
  storeFunction: StoreFunction;
  returnElements: ReturnElements;
  optionsIn: string;
  tabId: string;
}
export interface QueryContextState {
  queries: QueryContextElement[];
  tabIndex: number;
}

export type DispatchQuery = Dispatch<QueryAction>;

interface QueryContext {
  queryState: QueryContextState;
  dispatchQuery: DispatchQuery;
}

export const QueryContext = React.createContext<QueryContext>({} as QueryContext);

const getDefaultQueryContextElement = (): QueryContextElement => ({
  query: "",
  result: "",
  storeFunction: StoreFunction.GetFromStore,
  returnElements: ReturnElements.All,
  optionsIn: "",
  tabId: uuid()
});

const getDefaultQueryContextState = (): QueryContextState => ({
  queries: [getDefaultQueryContextElement()],
  tabIndex: 0
});

export enum QueryActionType {
  SetQuery,
  SetResult,
  SetStoreFunction,
  SetReturnElements,
  SetOptionsIn,
  SetFromTemplatePreset,
  SetTabIndex,
  AddTab,
  RemoveTab
}

export interface QueryAction {
  type: QueryActionType;
  tabIndex?: number;
  tabId?: string;
  query?: string;
  result?: string;
  storeFunction?: StoreFunction;
  returnElements?: ReturnElements;
  optionsIn?: string;
  templatePreset?: QueryTemplatePreset;
}

export const queryContextReducer = (state: QueryContextState, action: QueryAction): QueryContextState => {
  const queries = state.queries.map((query) => ({ ...query }));
  const tabIndex = action.tabIndex ?? state.tabIndex;

  switch (action.type) {
    case QueryActionType.SetQuery:
      queries[tabIndex].query = action.query;
      return { queries, tabIndex };
    case QueryActionType.SetResult:
      queries[tabIndex].result = action.result;
      return { queries, tabIndex };
    case QueryActionType.SetStoreFunction:
      queries[tabIndex].storeFunction = action.storeFunction;
      return { queries, tabIndex };
    case QueryActionType.SetReturnElements:
      queries[tabIndex].returnElements = action.returnElements;
      return { queries, tabIndex };
    case QueryActionType.SetOptionsIn:
      queries[tabIndex].optionsIn = action.optionsIn;
      return { queries, tabIndex };
    case QueryActionType.SetTabIndex:
      return { queries, tabIndex };
    case QueryActionType.SetFromTemplatePreset:
      return setFromTemplatePreset(state, action);
    case QueryActionType.AddTab:
      return { queries: [...queries, getDefaultQueryContextElement()], tabIndex: queries.length };
    case QueryActionType.RemoveTab:
      return removeTab(state, action);
    default:
      throw new Error();
  }
};

const setFromTemplatePreset = (state: QueryContextState, action: QueryAction): QueryContextState => {
  const template = getQueryTemplateWithPreset(action.templatePreset);
  if (!template) return state;
  const defaultValues = getDefaultQueryContextElement();
  const newQuery: QueryContextElement = {
    query: template,
    result: "",
    storeFunction: action.templatePreset.storeFunction ?? defaultValues.storeFunction,
    returnElements: action.templatePreset.returnElements ?? defaultValues.returnElements,
    optionsIn: action.templatePreset.optionsIn ?? defaultValues.optionsIn,
    tabId: uuid()
  };
  if (state.queries.length == 0 || (state.queries.length == 1 && state.queries[0].query == "")) {
    return { queries: [newQuery], tabIndex: 0 };
  }
  const queries = [...state.queries, newQuery];
  return { queries, tabIndex: queries.length - 1 };
};

const removeTab = (state: QueryContextState, action: QueryAction): QueryContextState => {
  const queries = [...state.queries];
  const tabIndexToRemove = queries.findIndex((q) => q.tabId === action.tabId);
  const isCurrentTab = tabIndexToRemove === state.tabIndex;
  const isLastTab = tabIndexToRemove === queries.length - 1;
  let newTabIndex = state.tabIndex;
  if (isCurrentTab && isLastTab && newTabIndex > 0) {
    newTabIndex--;
  } else if (tabIndexToRemove < state.tabIndex && state.tabIndex > 0) {
    newTabIndex--;
  }
  queries.splice(tabIndexToRemove, 1);
  if (queries.length === 0) queries.push(getDefaultQueryContextElement());
  return { queries, tabIndex: newTabIndex };
};

export interface QueryContextProviderProps {
  initialQueryState?: Partial<QueryContextState>;
  children?: React.ReactNode;
}

const getInitialQueryState = (initialQueryState: Partial<QueryContextState>): QueryContextState => {
  if (initialQueryState) return { ...getDefaultQueryContextState(), ...initialQueryState };
  return retrieveStoredQuery();
};

export function QueryContextProvider({ initialQueryState, children }: QueryContextProviderProps) {
  const [queryState, dispatchQuery] = React.useReducer(queryContextReducer, initialQueryState, getInitialQueryState);

  useEffect(() => {
    const dispatch = setTimeout(() => {
      setStoredQuery(queryState);
    }, 1000);
    return () => clearTimeout(dispatch);
  }, [queryState]);

  return <QueryContext.Provider value={{ queryState, dispatchQuery }}>{children}</QueryContext.Provider>;
}

const retrieveStoredQuery = () => {
  try {
    const storedQuery = localStorage.getItem(STORAGE_QUERYVIEW_DATA);
    const queryState = JSON.parse(storedQuery);
    validateQueryState(queryState);
    return queryState;
  } catch {
    return getDefaultQueryContextState();
  }
};

const setStoredQuery = (queryState: QueryContextState) => {
  try {
    // As results can be large, we don't store them in local storage
    const queryStateWithoutResults = {
      ...queryState,
      queries: queryState.queries.map((query) => ({ ...query, result: "" }))
    };
    localStorage.setItem(STORAGE_QUERYVIEW_DATA, JSON.stringify(queryStateWithoutResults));
  } catch {
    /* disregard unavailable local storage */
  }
};

const validateQueryState = (queryState: QueryContextState) => {
  if (!queryState) throw new Error("No query state");
  if (!("queries" in queryState) || !Array.isArray(queryState.queries)) throw new Error("Invalid queries in query state");
  if (!("tabIndex" in queryState) || typeof queryState.tabIndex !== "number") throw new Error("Invalid tabIndex in query state");

  queryState.queries.forEach((query, index) => {
    if (!("query" in query) || typeof query.query !== "string") throw new Error(`Invalid query in query state at index ${index}`);
    if (!("result" in query) || typeof query.result !== "string") throw new Error(`Invalid result in query state at index ${index}`);
    if (!("storeFunction" in query) || typeof query.storeFunction !== "string") throw new Error(`Invalid storeFunction in query state at index ${index}`);
    if (!("returnElements" in query) || typeof query.returnElements !== "string") throw new Error(`Invalid returnElements in query state at index ${index}`);
    if (!("optionsIn" in query) || typeof query.optionsIn !== "string") throw new Error(`Invalid optionsIn in query state at index ${index}`);
    if (!("tabId" in query) || typeof query.tabId !== "string") throw new Error(`Invalid tabId in query state at index ${index}`);
  });
};
