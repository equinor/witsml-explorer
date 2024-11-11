import { QueryClient } from "@tanstack/react-query";
import { ObjectFilterType } from "../../contexts/filter";
import { ComponentType, getParentType } from "../../models/componentType";
import { ObjectType } from "../../models/objectType";
import {
  QUERY_KEY_COMPONENTS,
  QUERY_KEY_JOB_INFO,
  QUERY_KEY_OBJECT,
  QUERY_KEY_OBJECTS,
  QUERY_KEY_OBJECT_SEARCH,
  QUERY_KEY_SERVERS,
  QUERY_KEY_WELL,
  QUERY_KEY_WELLBORE,
  QUERY_KEY_WELLBORES,
  QUERY_KEY_WELLS
} from "./queryKeys";

export const refreshServersQuery = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_SERVERS]
  });
};

export const refreshWellsQuery = (
  queryClient: QueryClient,
  serverUrl: string
) => {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_WELLS, serverUrl.toLowerCase()]
  });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_WELLBORES, serverUrl.toLowerCase()]
  });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_OBJECTS, serverUrl.toLowerCase()]
  });
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_COMPONENTS, serverUrl.toLowerCase()]
  });
};

export const refreshWellQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_WELL, serverUrl.toLowerCase(), wellUid.toLowerCase()]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_WELLBORES,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_OBJECTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_COMPONENTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase()
    ]
  });
};

export const refreshWellboresQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_WELLBORES,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_OBJECTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_COMPONENTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase()
    ]
  });
};

export const refreshWellboreQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_WELLBORE,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_OBJECTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_COMPONENTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase()
    ]
  });
};

export const refreshObjectsQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectType: ObjectType
) => {
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_OBJECTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase(),
      objectType.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_OBJECT,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase(),
      objectType.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_COMPONENTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase(),
      objectType.toLowerCase()
    ]
  });
};

export const refreshObjectQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectType: ObjectType,
  objectUid: string
) => {
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_OBJECT,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase(),
      objectType.toLowerCase(),
      objectUid.toLowerCase()
    ]
  });
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_COMPONENTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase(),
      objectType.toLowerCase(),
      objectUid.toLowerCase()
    ]
  });
};

export const refreshComponentsQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectUid: string,
  componentType: ComponentType
) => {
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_COMPONENTS,
      serverUrl.toLowerCase(),
      wellUid.toLowerCase(),
      wellboreUid.toLowerCase(),
      getParentType(componentType).toLowerCase(), // The object type of the parent object.
      objectUid.toLowerCase(),
      componentType.toLowerCase()
    ]
  });
};

export const refreshJobInfoQuery = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    queryKey: [QUERY_KEY_JOB_INFO]
  });
};

export const refreshSearchQuery = (
  queryClient: QueryClient,
  serverUrl: string,
  filterType: ObjectFilterType
) => {
  queryClient.invalidateQueries({
    queryKey: [
      QUERY_KEY_OBJECT_SEARCH,
      serverUrl.toLowerCase(),
      filterType.toString()
    ]
  });
};
