import React, { Dispatch, useEffect } from "react";
import { STORAGE_QUERYVIEW_DATA } from "../components/Constants";
import { QueryTemplatePreset, ReturnElements, StoreFunction, getQueryTemplateWithPreset } from "../components/ContentViews/QueryViewUtils";

export interface QueryContextState {
  query: string;
  storeFunction: StoreFunction;
  returnElements: ReturnElements;
  optionsIn: string;
}

export type DispatchQuery = Dispatch<QueryAction>;

interface QueryContext {
  queryState: QueryContextState;
  dispatchQuery: DispatchQuery;
}

const defaultQueryContextState: QueryContextState = {
  query: "",
  storeFunction: StoreFunction.GetFromStore,
  returnElements: ReturnElements.All,
  optionsIn: ""
};

export const QueryContext = React.createContext<QueryContext>({} as QueryContext);

export enum QueryActionType {
  SetQuery,
  SetStoreFunction,
  SetReturnElements,
  SetOptionsIn,
  SetFromTemplatePreset
}

export interface QueryAction {
  type: QueryActionType;
  query?: string;
  storeFunction?: StoreFunction;
  returnElements?: ReturnElements;
  optionsIn?: string;
  templatePreset?: QueryTemplatePreset;
}

export const queryContextReducer = (state: QueryContextState, action: QueryAction): QueryContextState => {
  switch (action.type) {
    case QueryActionType.SetQuery:
      return { ...state, query: action.query };
    case QueryActionType.SetStoreFunction:
      return { ...state, storeFunction: action.storeFunction };
    case QueryActionType.SetReturnElements:
      return { ...state, returnElements: action.returnElements };
    case QueryActionType.SetOptionsIn:
      return { ...state, optionsIn: action.optionsIn };
    case QueryActionType.SetFromTemplatePreset:
      return setFromTemplatePreset(state, action);
    default:
      throw new Error();
  }
};

const setFromTemplatePreset = (state: QueryContextState, action: QueryAction): QueryContextState => {
  const template = getQueryTemplateWithPreset(action.templatePreset);
  if (!template) return state;
  return {
    ...state,
    query: template,
    storeFunction: action.templatePreset.storeFunction ?? defaultQueryContextState.storeFunction,
    returnElements: action.templatePreset.returnElements ?? defaultQueryContextState.returnElements,
    optionsIn: action.templatePreset.optionsIn ?? defaultQueryContextState.optionsIn
  };
};

export interface QueryContextProviderProps {
  initialQueryState?: Partial<QueryContextState>;
  children?: React.ReactNode;
}

const getInitialQueryState = (initialQueryState: Partial<QueryContextState>): QueryContextState => {
  if (initialQueryState) return { ...defaultQueryContextState, ...initialQueryState };
  return { ...defaultQueryContextState, ...retrieveStoredQuery() };
};

export function QueryContextProvider({ initialQueryState, children }: QueryContextProviderProps) {
  const [queryState, dispatchQuery] = React.useReducer(queryContextReducer, initialQueryState, getInitialQueryState);

  useEffect(() => {
    const dispatch = setTimeout(() => {
      setStoredQuery(queryState);
    }, 200);
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
    return defaultQueryContextState;
  }
};

const setStoredQuery = (queryState: QueryContextState) => {
  try {
    localStorage.setItem(STORAGE_QUERYVIEW_DATA, JSON.stringify(queryState));
  } catch {
    /* disregard unavailable local storage */
  }
};

const validateQueryState = (queryState: any) => {
  if (!queryState) throw new Error("No query state");
  if (!("query" in queryState) || typeof queryState.query !== "string") throw new Error("Invalid query in query state");
  if (!("storeFunction" in queryState) || typeof queryState.storeFunction !== "string") throw new Error("Invalid storeFunction in query state");
  if (!("returnElements" in queryState) || typeof queryState.returnElements !== "string") throw new Error("Invalid returnElements in query state");
  if (!("optionsIn" in queryState) || typeof queryState.optionsIn !== "string") throw new Error("Invalid optionsIn in query state");
};
