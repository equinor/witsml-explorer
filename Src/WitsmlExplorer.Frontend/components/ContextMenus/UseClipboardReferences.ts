import ObjectReferences from "models/jobs/objectReferences";
import { ObjectType } from "models/objectType";
import { useEffect, useState } from "react";

export const useClipboardReferences = (
  pollInterval = 0
): ObjectReferences | null => {
  const [objectReferences, setReferences] = useState<ObjectReferences>(null);

  const tryToParseClipboardContent = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const objectReferences = parseStringToReferences(clipboardText);
      setReferences(objectReferences);
    } catch (e) {
      //Not a valid object on the clipboard? That is fine, we won't use it.
    }
  };

  useEffect(() => {
    tryToParseClipboardContent();
    let timer: number;
    if (pollInterval > 0) {
      timer = window.setInterval(tryToParseClipboardContent, pollInterval);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  return objectReferences;
};

export const useClipboardReferencesOfType = (
  type: ObjectType,
  pollInterval = 0
): ObjectReferences | null => {
  const objectReferences = useClipboardReferences(pollInterval);
  return objectReferences?.objectType == type ? objectReferences : null;
};

export function parseStringToReferences(input: string): ObjectReferences {
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
  const requiredProps = [
    "serverUrl",
    "wellUid",
    "wellboreUid",
    "objectUids",
    "objectType",
    "wellName",
    "wellboreName",
    "names"
  ];
  const hasRequiredProperties = requiredProps.every((prop) =>
    Object.prototype.hasOwnProperty.call(jsonObject, prop)
  );
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}
