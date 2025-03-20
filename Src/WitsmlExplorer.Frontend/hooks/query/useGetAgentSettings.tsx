import { QUERY_KEY_AGENT_SETTINGS } from "./queryKeys.tsx";
import { QueryOptions } from "./queryOptions.tsx";
import AgentSettingsService from "../../services/agentSettingsService.tsx";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { AgentSettings } from "models/AgentSettings.tsx";

export const getAgentSettingsKey = () => {
  return [QUERY_KEY_AGENT_SETTINGS];
};

export const agentSettingsQuery = (options?: QueryOptions) => ({
  queryKey: getAgentSettingsKey(),
  queryFn: async () => {
    const agentSettings = await AgentSettingsService.getAgentSettings();
    return agentSettings;
  },
  ...options
});

type AgentSettingsQueryResult = Omit<
  QueryObserverResult<AgentSettings, unknown>,
  "data"
> & {
  agentSettings: AgentSettings;
};

export const useGetAgentSettings = (
  options?: QueryOptions
): AgentSettingsQueryResult => {
  const { data, ...state } = useQuery<AgentSettings>(
    agentSettingsQuery(options)
  );
  return { agentSettings: data, ...state };
};
