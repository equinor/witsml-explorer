import ObjectSearchListView from "components/ContentViews/ObjectSearchListView";
import { WellboreSearchListView } from "components/ContentViews/WellboreSearchListView";
import {
  FilterType,
  isObjectFilterType,
  isWellboreFilterType
} from "contexts/filter";
import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { PageNotFound } from "routes/PageNotFound";

export const SearchListView = (): ReactElement => {
  const { filterType } = useParams<{ filterType: FilterType }>();

  if (isObjectFilterType(filterType)) {
    return <ObjectSearchListView />;
  } else if (isWellboreFilterType(filterType)) {
    return <WellboreSearchListView />;
  }

  return <PageNotFound />;
};
