export interface DataGridProperty {
  name: string;
  documentation: string;
  isAttribute?: boolean;
  isContainer?: boolean;
  isMultiple?: boolean;
  properties?: DataGridProperty[];
}
