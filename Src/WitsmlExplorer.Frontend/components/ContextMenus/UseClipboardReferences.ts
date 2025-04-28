import ObjectReferences from "models/jobs/objectReferences";
import WellboreReference from "models/jobs/wellboreReference";
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
    } catch {
      //Not a valid object on the clipboard? That is fine, we won't use it.
    }
  };

  useEffect(() => {
    tryToParseClipboardContent();
    let timer: ReturnType<typeof setInterval>;
    if (pollInterval > 0) {
      timer = setInterval(tryToParseClipboardContent, pollInterval);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  return objectReferences;
};

export const useWellboreReference = (
  pollInterval = 0
): WellboreReference | null => {
  const [wellboreReference, setWellboreReference] =
    useState<WellboreReference>(null);

  const tryToParseClipboardContent = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const wellboreReference = parseWellboreStringToReference(clipboardText);
      setWellboreReference(wellboreReference);
    } catch {
      //Not a valid object on the clipboard? That is fine, we won't use it.
    }
  };

  useEffect(() => {
    tryToParseClipboardContent();
    let timer: ReturnType<typeof setInterval>;
    if (pollInterval > 0) {
      timer = setInterval(tryToParseClipboardContent, pollInterval);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  return wellboreReference;
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
  } catch (e) {
    throw new Error("Invalid input given.", e);
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}

export function parseWellboreStringToReference(
  input: string
): WellboreReference {
  let jsonObject: WellboreReference;
  try {
    jsonObject = JSON.parse(input);
  } catch (e) {
    throw new Error("Invalid input given.", e);
  }
  verifyRequiredWellboreProperties(jsonObject);
  return jsonObject;
}

function verifyRequiredWellboreProperties(jsonObject: WellboreReference) {
  const requiredProps = [
    "wellUid",
    "wellboreUid",
    "wellName",
    "wellboreName",
    "serverUrl"
  ];
  const hasRequiredProperties = requiredProps.every((prop) =>
    Object.prototype.hasOwnProperty.call(jsonObject, prop)
  );
  if (!hasRequiredProperties) {
    throw new Error("Missing required wellbore fields.");
  }
  Object.keys(jsonObject).forEach((key) => {
    if (requiredProps.indexOf(key) < 0) {
      throw new Error("Other than required properties found.");
    }
  });
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
