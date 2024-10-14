export const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
};

export const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split(".");
  let currentLevel = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!currentLevel[keys[i]]) {
      currentLevel[keys[i]] = {};
    }
    currentLevel = currentLevel[keys[i]];
  }

  currentLevel[keys[keys.length - 1]] = value;
  return obj;
};

export const deleteNestedValue = (obj: any, path: string) => {
  const keys = path.split(".");
  let currentLevel = obj;
  let deepestLevel = obj;
  let deepestLevelProperty = keys[0];

  for (let i = 0; i < keys.length - 1; i++) {
    if (!currentLevel[keys[i]]) {
      break;
    }
    if (Object.keys(currentLevel[keys[i]]).length > 1) {
      deepestLevel = currentLevel[keys[i]];
      deepestLevelProperty = keys[i + 1];
    }
    currentLevel = currentLevel[keys[i]];
  }
  delete deepestLevel[deepestLevelProperty];
  return obj;
};
