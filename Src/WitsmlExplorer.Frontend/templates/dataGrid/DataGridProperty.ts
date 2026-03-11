export interface DataGridProperty {
  name: string;
  documentation: string;
  required?: boolean;
  baseType?: string;
  witsmlType?: string;
  maxLength?: number;
  isAttribute?: boolean;
  isContainer?: boolean;
  isMultiple?: boolean;
  properties?: DataGridProperty[];
}
