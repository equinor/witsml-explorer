import { useEffect, useState } from "react";
import ObjectReferences from "../../models/jobs/objectReferences";
import { ObjectType } from "../../models/objectType";

export const useClipboardReferences: () => ObjectReferences | null = () => {
  const [objectReferences, setReferences] = useState<ObjectReferences>(null);

  useEffect(() => {
    const tryToParseClipboardContent = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const objectReferences = parseStringToReferences(clipboardText);
        setReferences(objectReferences);
      } catch (e) {
        //Not a valid object on the clipboard? That is fine, we won't use it.
      }
    };
    tryToParseClipboardContent();
  }, []);

  return objectReferences;
};

export const useClipboardReferencesOfType = (type: ObjectType): ObjectReferences | null => {
  const objectReferences = useClipboardReferences();
  return objectReferences?.objectType == type ? objectReferences : null;
};

function parseStringToReferences(input: string): ObjectReferences {
  let jsonObject: ObjectReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (error) {
    throw new Error("Invalid input given.");
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}

function verifyRequiredProperties(jsonObject: ObjectReferences) {
  const requiredProps = ["serverUrl", "wellUid", "wellboreUid", "objectUids", "objectType"];
  const hasRequiredProperties = requiredProps.every((prop) => Object.prototype.hasOwnProperty.call(jsonObject, prop));
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}
