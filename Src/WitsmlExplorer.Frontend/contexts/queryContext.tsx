import {
  QueryTemplatePreset,
  ReturnElements,
  StoreFunction,
  getQueryTemplateWithPreset
} from "components/ContentViews/QueryViewUtils";
import { useLocalStorageState } from "hooks/useLocalStorageState";
import React, { Dispatch, useEffect } from "react";
import {
  STORAGE_QUERYVIEW_DATA,
  getLocalStorageItem
} from "tools/localStorageHelpers";
import { v4 as uuid } from "uuid";

export interface QueryElement {
  query: string;
  result: string;
  storeFunction: StoreFunction;
  returnElements: ReturnElements;
  optionsIn: string;
  tabId: string;
}
export interface QueryState {
  queries: QueryElement[];
  tabIndex: number;
}

export type DispatchQuery = Dispatch<QueryAction>;

interface QueryContext {
  queryState: QueryState;
  dispatchQuery: DispatchQuery;
}

export const QueryContext = React.createContext<QueryContext>(
  {} as QueryContext
);

const getDefaultQueryElement = (): QueryElement => ({
  query: "",
  result: "",
  storeFunction: StoreFunction.GetFromStore,
  returnElements: ReturnElements.All,
  optionsIn: "",
  tabId: uuid()
});

const getDefaultQueryState = (): QueryState => ({
  queries: [getDefaultQueryElement()],
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

export const queryReducer = (
  state: QueryState,
  action: QueryAction
): QueryState => {
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
      return {
        queries: [...queries, getDefaultQueryElement()],
        tabIndex: queries.length
      };
    case QueryActionType.RemoveTab:
      return removeTab(state, action);
    default:
      throw new Error();
  }
};

const setFromTemplatePreset = (
  state: QueryState,
  action: QueryAction
): QueryState => {
  const template = getQueryTemplateWithPreset(action.templatePreset);
  if (!template) return state;
  const defaultValues = getDefaultQueryElement();
  const newQuery: QueryElement = {
    query: template,
    result: "",
    storeFunction:
      action.templatePreset.storeFunction ?? defaultValues.storeFunction,
    returnElements:
      action.templatePreset.returnElements ?? defaultValues.returnElements,
    optionsIn: action.templatePreset.optionsIn ?? defaultValues.optionsIn,
    tabId: uuid()
  };
  if (
    state.queries.length === 0 ||
    (state.queries.length === 1 && state.queries[0].query === "")
  ) {
    return { queries: [newQuery], tabIndex: 0 };
  }
  const queries = [...state.queries, newQuery];
  return { queries, tabIndex: queries.length - 1 };
};

const removeTab = (state: QueryState, action: QueryAction): QueryState => {
  const queries = [...state.queries];
  const tabIndexToRemove = queries.findIndex((q) => q.tabId === action.tabId);
  const isCurrentTab = tabIndexToRemove === state.tabIndex;
  const isLastTab = tabIndexToRemove === queries.length - 1;
  let newTabIndex = state.tabIndex;
  if (
    (isCurrentTab && isLastTab && newTabIndex > 0) ||
    (tabIndexToRemove < state.tabIndex && state.tabIndex > 0)
  ) {
    newTabIndex--;
  }
  queries.splice(tabIndexToRemove, 1);
  if (queries.length === 0) queries.push(getDefaultQueryElement());
  return { queries, tabIndex: newTabIndex };
};

const getInitialQueryState = (
  initialQueryState: Partial<QueryState>
): QueryState => {
  if (initialQueryState)
    return { ...getDefaultQueryState(), ...initialQueryState };
  return getLocalStorageItem<QueryState>(STORAGE_QUERYVIEW_DATA, {
    defaultValue: getDefaultQueryState(),
    valueVerifier: validateQueryState
  });
};

export interface QueryContextProviderProps {
  initialQueryState?: Partial<QueryState>;
  children?: React.ReactNode;
}

export function QueryContextProvider({
  initialQueryState,
  children
}: QueryContextProviderProps) {
  const [queryState, dispatchQuery] = React.useReducer(
    queryReducer,
    initialQueryState,
    getInitialQueryState
  );
  const [, setLocalStorageQuery] = useLocalStorageState<QueryState>(
    STORAGE_QUERYVIEW_DATA,
    {
      storageTransformer: (state) => ({
        ...state,
        queries: state.queries.map((query) => ({ ...query, result: "" }))
      })
    }
  );

  useEffect(() => {
    setLocalStorageQuery(queryState);
  }, [queryState]);

  return (
    <QueryContext.Provider value={{ queryState, dispatchQuery }}>
      {children}
    </QueryContext.Provider>
  );
}

const validateQueryState = (queryState: QueryState): boolean => {
  if (!queryState) return false;

  const hasValidProperty = (obj: any, prop: string, type: string) =>
    prop in obj && typeof obj[prop] === type;

  if (
    !hasValidProperty(queryState, "queries", "object") ||
    !Array.isArray(queryState.queries)
  )
    return false;
  if (!hasValidProperty(queryState, "tabIndex", "number")) return false;

  return queryState.queries.every(
    (query) =>
      hasValidProperty(query, "query", "string") &&
      hasValidProperty(query, "result", "string") &&
      hasValidProperty(query, "storeFunction", "string") &&
      hasValidProperty(query, "returnElements", "string") &&
      hasValidProperty(query, "optionsIn", "string") &&
      hasValidProperty(query, "tabId", "string")
  );
};
