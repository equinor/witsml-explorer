import { ComponentType } from "models/componentType";
import ObjectReference from "models/jobs/objectReference";
import ObjectOnWellbore, { toObjectReference } from "models/objectOnWellbore";

export default interface ComponentReferences {
  serverUrl?: string;
  parent: ObjectReference;
  componentType: ComponentType;
  componentUids: string[];
}

export interface CopyRangeClipboard extends ComponentReferences {
  startIndex?: string;
  endIndex?: string;
}

export function createComponentReferences(
  uids: string[],
  parent: ObjectOnWellbore,
  componentType: ComponentType,
  serverUrl?: string
): ComponentReferences {
  return {
    serverUrl: serverUrl,
    parent: toObjectReference(parent),
    componentUids: uids,
    componentType
  };
}
