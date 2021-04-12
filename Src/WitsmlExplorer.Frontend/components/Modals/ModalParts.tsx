export enum PropertiesModalMode {
  New,
  Edit
}

export const validText = (text: string): boolean => {
  return text && text.length > 0;
};
