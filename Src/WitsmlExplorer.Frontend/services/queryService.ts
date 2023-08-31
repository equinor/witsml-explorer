import { ReturnElements, StoreFunction } from "../components/ContentViews/QueryView";
import { ApiClient } from "./apiClient";

export default class QueryService {
  public static async postQuery(query: string, storeFunction: StoreFunction, returnElements?: ReturnElements, abortSignal?: AbortSignal): Promise<string> {
    const payload = {
      body: query,
      ...(returnElements ? { returnElements } : {})
    };
    const response = await ApiClient.post(`/api/query/${storeFunction.toLowerCase()}`, JSON.stringify(payload), abortSignal);
    if (response.ok) {
      return response.json();
    } else {
      return `${response.status} ${response.statusText}`;
    }
  }
}
