import { useGetWellbores } from "hooks/query/useGetWellbores";
import Wellbore from "models/wellbore";
import { useMemo } from "react";
import { WitsmlProtocol } from "services/authorizationService";
import {
  WellboreFilterType,
  filterTypeToProperty,
  getSearchRegex,
  isSitecomSyntax
} from "../../contexts/filter";
import { Server } from "../../models/server";
import { QueryOptions } from "./queryOptions";

type WellboreSearchQueryResult = {
  wellboreSearchResults: Wellbore[];
  error: Error;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  dataUpdatedAt: number;
  responseTime: number;
  usedProtocol?: WitsmlProtocol;
};

export const useGetWellboreSearch = (
  server: Server,
  filterType: WellboreFilterType,
  value: string,
  options?: QueryOptions
): WellboreSearchQueryResult => {
  const { wellbores, ...state } = useGetWellbores(server, "", options);

  const filteredData = useMemo(() => {
    const regex = getSearchRegex(value, true);
    const property = filterTypeToProperty[filterType] as keyof Wellbore;
    return (
      wellbores?.filter(
        (result) =>
          isSitecomSyntax(value) || regex.test(result[property].toString())
      ) ?? []
    );
  }, [wellbores, value]);

  return { wellboreSearchResults: filteredData, ...state };
};
