import { AgentSettings } from "../models/AgentSettings.tsx";
import { ApiClient, throwError } from "./apiClient.tsx";
import { ErrorDetails } from "../models/errorDetails.ts";

export default class AgentSettingsService {
  public static async addAgentSettings(
    agentSettings: AgentSettings,
    abortSignal?: AbortSignal
  ): Promise<AgentSettings> {
    const response = await ApiClient.post(
      `/api/agent-settings`,
      JSON.stringify(agentSettings),
      abortSignal,
      undefined
    );
    if (response.ok) {
      return response.json();
    } else {
      throwError(response.status, response.statusText);
    }
  }

  public static async updateAgentSettings(
    agentSettings: AgentSettings,
    abortSignal?: AbortSignal
  ): Promise<AgentSettings> {
    const response = await ApiClient.patch(
      `/api/agent-settings`,
      JSON.stringify(agentSettings),
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      throwError(response.status, response.statusText);
    }
  }

  public static async removeAgentSettings(
    abortSignal?: AbortSignal
  ): Promise<boolean> {
    const response = await ApiClient.delete(`/api/agent-settings`, abortSignal);
    if (response.ok) {
      return true;
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }

  public static async getAgentSettings(
    abortSignal?: AbortSignal
  ): Promise<AgentSettings> {
    const response = await ApiClient.get(`/api/agent-settings`, abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      const { message }: ErrorDetails = await response.json();
      throwError(response.status, message);
    }
  }
}
