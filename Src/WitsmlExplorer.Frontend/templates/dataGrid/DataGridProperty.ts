export interface DataGridProperty {
  id: string;
  name: string;
  documentation: string;
  isAttribute?: boolean;
  multiple?: boolean;
  properties?: DataGridProperty[];
}
