import { useMatch } from "react-router-dom";
import {
  JOBS_VIEW_NAVIGATION_PATH,
  LOG_CURVE_VALUES_VIEW_NAVIGATION_PATH,
  LOG_OBJECTS_VIEW_NAVIGATION_PATH,
  LOG_OBJECT_VIEW_NAVIGATION_PATH,
  LOG_TYPES_VIEW_NAVIGATION_PATH,
  MULTI_LOGS_CURVE_INFO_LIST_VIEW_NAVIGATION_PATH,
  MULTI_LOGS_CURVE_VALUES_NAVIGATION_PATH,
  OBJECTS_VIEW_NAVIGATION_PATH,
  OBJECT_GROUPS_VIEW_NAVIGATION_PATH,
  OBJECT_VIEW_NAVIGATION_PATH,
  QUERY_VIEW_NAVIGATION_PATH,
  SEARCH_VIEW_NAVIGATION_PATH,
  WELLSBORES_VIEW_NAVIGATION_PATH,
  WELLS_VIEW_NAVIGATION_PATH
} from "routes/routerConstants";

export function useGetActiveRoute() {
  const isJobsView = !!useMatch(JOBS_VIEW_NAVIGATION_PATH);
  const isQueryView = !!useMatch(QUERY_VIEW_NAVIGATION_PATH);
  const isSearchView = !!useMatch(SEARCH_VIEW_NAVIGATION_PATH);
  const isWellsView = !!useMatch(WELLS_VIEW_NAVIGATION_PATH);
  const isWellboresView = !!useMatch(WELLSBORES_VIEW_NAVIGATION_PATH);
  const isObjectGroupsView = !!useMatch(OBJECT_GROUPS_VIEW_NAVIGATION_PATH);
  const isObjectsView = !!useMatch(OBJECTS_VIEW_NAVIGATION_PATH);
  const isObjectView = !!useMatch(OBJECT_VIEW_NAVIGATION_PATH);
  const isLogTypesView = !!useMatch(LOG_TYPES_VIEW_NAVIGATION_PATH);
  const isLogObjectsView = !!useMatch(LOG_OBJECTS_VIEW_NAVIGATION_PATH);
  const isLogObjectView = !!useMatch(LOG_OBJECT_VIEW_NAVIGATION_PATH);
  const isLogCurveValuesView = !!useMatch(
    LOG_CURVE_VALUES_VIEW_NAVIGATION_PATH
  );
  const isMultiLogsCurveInfoListView = !!useMatch(
    MULTI_LOGS_CURVE_INFO_LIST_VIEW_NAVIGATION_PATH
  );
  const isMultiLogCurveValuesView = !!useMatch(
    MULTI_LOGS_CURVE_VALUES_NAVIGATION_PATH
  );
  return {
    isJobsView,
    isQueryView,
    isSearchView,
    isWellsView,
    isWellboresView,
    isObjectGroupsView,
    isObjectsView,
    isObjectView,
    isLogTypesView,
    isLogObjectsView,
    isLogObjectView,
    isLogCurveValuesView,
    isMultiLogsCurveInfoListView,
    isMultiLogCurveValuesView
  };
}
