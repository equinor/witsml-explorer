import { useEffect, useState } from "react";
import { ComponentType } from "models/componentType";
import ComponentReferences from "models/jobs/componentReferences";

const useClipboardComponentReferences: () => ComponentReferences | null =
  () => {
    const [componentReferences, setReferences] =
      useState<ComponentReferences>(null);

    useEffect(() => {
      const tryToParseClipboardContent = async () => {
        try {
          const clipboardText = await navigator.clipboard.readText();
          const componentReferences =
            parseStringToComponentReferences(clipboardText);
          setReferences(componentReferences);
        } catch (e) {
          console.error(e);
          //Not a valid object on the clipboard? That is fine, we won't use it.
        }
      };
      tryToParseClipboardContent();
    }, []);

    return componentReferences;
  };

export const useClipboardComponentReferencesOfType = (
  type: ComponentType
): ComponentReferences | null => {
  const componentReferences = useClipboardComponentReferences();
  return componentReferences?.componentType == type
    ? componentReferences
    : null;
};

export function parseStringToComponentReferences(
  input: string
): ComponentReferences {
  let jsonObject: ComponentReferences;
  try {
    jsonObject = JSON.parse(input);
  } catch (e) {
    throw new Error("Invalid input given.", e);
  }
  verifyRequiredProperties(jsonObject);
  return jsonObject;
}

function verifyRequiredProperties(jsonObject: ComponentReferences) {
  const requiredProps = [
    "serverUrl",
    "parent",
    "componentUids",
    "componentType"
  ];
  const hasRequiredProperties = requiredProps.every((prop) =>
    Object.prototype.hasOwnProperty.call(jsonObject, prop)
  );
  if (!hasRequiredProperties) {
    throw new Error("Missing required fields.");
  }
}
