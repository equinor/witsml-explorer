import { ApiClient } from "./apiClient.tsx";
import {
  MnemonicsMappingsQuery,
  MnemonicsMappingsQueryResult
} from "../models/mnemonicsMappingsQuery.tsx";

export default class MnemonicsMappingService {
  public static async queryMnemonicsMappings(
    query: MnemonicsMappingsQuery,
    abortSignal?: AbortSignal
  ): Promise<MnemonicsMappingsQueryResult> {
    const response = await ApiClient.post(
      `/api/mnemonicmappings`,
      JSON.stringify(query),
      abortSignal,
      undefined
    );
    if (response.ok) {
      return response.json();
    } else {
      return undefined;
    }
  }
}
