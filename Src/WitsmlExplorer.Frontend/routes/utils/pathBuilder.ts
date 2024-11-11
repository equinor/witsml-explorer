import {
  FILTER_TYPE_PARAM,
  JOBS_VIEW_NAVIGATION_PATH,
  LOG_CURVE_VALUES_VIEW_NAVIGATION_PATH,
  LOG_OBJECTS_VIEW_NAVIGATION_PATH,
  LOG_OBJECT_VIEW_NAVIGATION_PATH,
  LOG_TYPES_VIEW_NAVIGATION_PATH,
  LOG_TYPE_PARAM,
  MULTI_LOGS_CURVE_INFO_LIST_VIEW_NAVIGATION_PATH,
  MULTI_LOGS_CURVE_VALUES_NAVIGATION_PATH,
  OBJECTS_VIEW_NAVIGATION_PATH,
  OBJECT_GROUPS_VIEW_NAVIGATION_PATH,
  OBJECT_GROUP_PARAM,
  OBJECT_UID_PARAM,
  OBJECT_VIEW_NAVIGATION_PATH,
  QUERY_VIEW_NAVIGATION_PATH,
  SEARCH_VIEW_NAVIGATION_PATH,
  SERVER_URL_PARAM,
  WELLBORE_UID_PARAM,
  WELLSBORES_VIEW_NAVIGATION_PATH,
  WELLS_VIEW_NAVIGATION_PATH,
  WELL_UID_PARAM
} from "routes/routerConstants";

export function getJobsViewPath(serverUrl: string) {
  const jobsViewPath = JOBS_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  );
  return jobsViewPath;
}

export function getQueryViewPath(serverUrl: string) {
  const queryViewPath = QUERY_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  );
  return queryViewPath;
}

export function getSearchViewPath(serverUrl: string, filterType: string) {
  const searchViewPath = SEARCH_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  ).replace(FILTER_TYPE_PARAM, filterType);
  return searchViewPath;
}

export function getWellsViewPath(serverUrl: string) {
  const wellsViewPath = WELLS_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  );
  return wellsViewPath;
}

export function getWellboresViewPath(serverUrl: string, wellUid: string) {
  const wellboresViewPath = WELLSBORES_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  ).replace(WELL_UID_PARAM, encodeURIComponent(wellUid));
  return wellboresViewPath;
}

export function getObjectGroupsViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string
) {
  const objectGroupsViewPath = OBJECT_GROUPS_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  )
    .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
    .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid));
  return objectGroupsViewPath;
}

export function getObjectsViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string
) {
  const objectsViewPath = OBJECTS_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  )
    .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
    .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid))
    .replace(OBJECT_GROUP_PARAM, objectGroup);
  return objectsViewPath;
}

export function getObjectViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string,
  objectUid: string
) {
  const objectViewPath = OBJECT_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  )
    .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
    .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid))
    .replace(OBJECT_GROUP_PARAM, objectGroup)
    .replace(OBJECT_UID_PARAM, encodeURIComponent(objectUid));
  return objectViewPath;
}

export function getLogTypesViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string
) {
  const logTypesViewPath = LOG_TYPES_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  )
    .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
    .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid))
    .replace(OBJECT_GROUP_PARAM, objectGroup);
  return logTypesViewPath;
}

export function getLogObjectsViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string,
  logType: string
) {
  const logObjectsViewPath = LOG_OBJECTS_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  )
    .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
    .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid))
    .replace(OBJECT_GROUP_PARAM, objectGroup)
    .replace(LOG_TYPE_PARAM, logType);
  return logObjectsViewPath;
}

export function getLogObjectViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string,
  logType: string,
  objectUid: string
) {
  const logObjectViewPath = LOG_OBJECT_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  )
    .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
    .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid))
    .replace(OBJECT_GROUP_PARAM, objectGroup)
    .replace(LOG_TYPE_PARAM, logType)
    .replace(OBJECT_UID_PARAM, encodeURIComponent(objectUid));
  return logObjectViewPath;
}

export function getLogCurveValuesViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string,
  logType: string,
  objectUid: string
) {
  const logCurveValuesViewPath = LOG_CURVE_VALUES_VIEW_NAVIGATION_PATH.replace(
    SERVER_URL_PARAM,
    encodeURIComponent(serverUrl)
  )
    .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
    .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid))
    .replace(OBJECT_GROUP_PARAM, objectGroup)
    .replace(LOG_TYPE_PARAM, logType)
    .replace(OBJECT_UID_PARAM, encodeURIComponent(objectUid));
  return logCurveValuesViewPath;
}

export function getMultiLogCurveInfoListViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string,
  logType: string
) {
  const logCurveValuesViewPath =
    MULTI_LOGS_CURVE_INFO_LIST_VIEW_NAVIGATION_PATH.replace(
      SERVER_URL_PARAM,
      encodeURIComponent(serverUrl)
    )
      .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
      .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid))
      .replace(OBJECT_GROUP_PARAM, objectGroup)
      .replace(LOG_TYPE_PARAM, logType);
  return logCurveValuesViewPath;
}

export function getMultiLogCurveValuesViewPath(
  serverUrl: string,
  wellUid: string,
  wellboreUid: string,
  objectGroup: string,
  logType: string
) {
  const logCurveValuesViewPath =
    MULTI_LOGS_CURVE_VALUES_NAVIGATION_PATH.replace(
      SERVER_URL_PARAM,
      encodeURIComponent(serverUrl)
    )
      .replace(WELL_UID_PARAM, encodeURIComponent(wellUid))
      .replace(WELLBORE_UID_PARAM, encodeURIComponent(wellboreUid))
      .replace(OBJECT_GROUP_PARAM, objectGroup)
      .replace(LOG_TYPE_PARAM, logType);
  return logCurveValuesViewPath;
}
