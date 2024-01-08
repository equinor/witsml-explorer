import {
  ReturnElements,
  StoreFunction
} from "components/ContentViews/QueryViewUtils";
import { ApiClient } from "services/apiClient";

export default class QueryService {
  public static async postQuery(
    query: string,
    storeFunction: StoreFunction,
    returnElements?: ReturnElements,
    optionsIn?: string,
    abortSignal?: AbortSignal
  ): Promise<string> {
    const payload = {
      body: query,
      ...(returnElements ? { returnElements } : {}),
      ...(optionsIn ? { optionsInString: optionsIn } : {})
    };
    const response = await ApiClient.post(
      `/api/query/${storeFunction.toLowerCase()}`,
      JSON.stringify(payload),
      abortSignal
    );
    if (response.ok) {
      return response.json();
    } else {
      return `${response.status} ${response.statusText}`;
    }
  }
}
