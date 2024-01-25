import {
  getQueryParamsFromState,
  getQueryParamsFromUrl
} from "components/Routing";
import { NavigationState } from "contexts/navigationContext";
import {
  SERVER_1,
  WELLBORE_1,
  WELL_1,
  getInitialState
} from "contexts/stateReducerTestUtils";
import { ParsedUrlQuery } from "querystring";
import * as url from "url";

it("Should include the server, well, and wellbore when generating the URL from state", () => {
  const initialState: NavigationState = {
    ...getInitialState(),
    selectedWell: WELL_1,
    selectedWellbore: WELLBORE_1,
    selectedServer: SERVER_1
  };
  const queryParams = getQueryParamsFromState(initialState);

  //using deprecated formatting because that's what Next seems to use
  const result = url.format({
    pathname: "/",
    query: { ...queryParams }
  });

  // Rewriting the following assertion may indicate that urls have changed
  // If so, maintainers of software that links to a deployment of Witsml Explorer should be notified
  expect(result).toStrictEqual(
    `/?serverUrl=${encodeURIComponent(
      SERVER_1.url
    )}&wellUid=${encodeURIComponent(
      WELL_1.uid
    )}&wellboreUid=${encodeURIComponent(WELLBORE_1.uid)}`
  );
});

it("Should get the server url, well uid, and wellbore uid when getting query params from url", () => {
  const serverUrl = "url1";
  const wellUid = "uid1";
  const wellboreUid = "uid2";
  const query: ParsedUrlQuery = {
    serverUrl: serverUrl,
    wellUid: wellUid,
    wellboreUid: wellboreUid
  };

  const result = getQueryParamsFromUrl(query);
  expect(result.serverUrl).toStrictEqual(serverUrl);
  expect(result.wellUid).toStrictEqual(wellUid);
  expect(result.wellboreUid).toStrictEqual(wellboreUid);
});
