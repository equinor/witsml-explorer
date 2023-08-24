import { ReturnElements } from "../components/ContentViews/QueryView";
import { ApiClient } from "./apiClient";

export default class QueryService {
  public static async postQuery(query: string, returnElements: ReturnElements, abortSignal?: AbortSignal): Promise<string> {
    const response = await ApiClient.post(`/api/query`, JSON.stringify({ body: query, returnElements }), abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return `${response.status} ${response.statusText}`;
    }
  }
}
