import { ComponentType } from "../componentType";
import ObjectOnWellbore, { toObjectReference } from "../objectOnWellbore";
import ObjectReference from "./objectReference";

export default interface ComponentReferences {
  serverUrl?: string;
  parent: ObjectReference;
  componentType: ComponentType;
  componentUids: string[];
}

export function createComponentReferences(uids: string[], parent: ObjectOnWellbore, componentType: ComponentType, serverUrl?: string): ComponentReferences {
  return {
    serverUrl: serverUrl,
    parent: toObjectReference(parent),
    componentUids: uids,
    componentType
  };
}
