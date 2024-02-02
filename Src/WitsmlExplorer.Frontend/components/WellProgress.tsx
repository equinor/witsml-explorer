import React from "react";
import { useAuthorizationState } from "../contexts/authorizationStateContext";
import { useGetWells } from "../hooks/query/useGetWells";
import ProgressSpinner from "./ProgressSpinner";

type Props = {
  children: JSX.Element;
};

const WellProgress = ({ children }: Props): React.ReactElement => {
  const { authorizationState } = useAuthorizationState();
  const { isFetching } = useGetWells(authorizationState?.server);
  return isFetching ? (
    <ProgressSpinner message="Fetching wells. This may take some time." />
  ) : (
    children
  );
};

export default WellProgress;
