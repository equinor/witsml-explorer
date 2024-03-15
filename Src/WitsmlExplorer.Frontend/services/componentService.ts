import { pluralize } from "components/ContextMenus/ContextMenuUtils";
import {
  ComponentType,
  ComponentTypeToModel,
  getParentType
} from "models/componentType";
import { Server } from "models/server";
import { ApiClient } from "services/apiClient";

export default class ComponentService {
  public static async getComponents<Key extends ComponentType>(
    wellUid: string,
    wellboreUid: string,
    objectUid: string,
    componentType: Key,
    server?: Server,
    abortSignal?: AbortSignal
  ): Promise<ComponentTypeToModel[Key][]> {
    const componentRoute = pluralize(componentType).toLowerCase();
    const typeRoute = pluralize(getParentType(componentType)).toLowerCase();
    const response = await ApiClient.get(
      `/api/wells/${encodeURIComponent(wellUid)}/wellbores/${encodeURIComponent(
        wellboreUid
      )}/${typeRoute}/${encodeURIComponent(objectUid)}/${componentRoute}`,
      abortSignal,
      server
    );
    if (response.ok) {
      const text = await response.text();
      if (text.length) {
        return JSON.parse(text);
      } else {
        return [];
      }
    }
    return [];
  }
}
