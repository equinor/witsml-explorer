/**
 * PropertyType options and details:
 *
 * PropertyType.String:
 * - A simple text input.
 * - Can be multi-line if `multiline` is set to true.
 *
 * PropertyType.StringNumber:
 * - A numerical input that returns the number as a string.
 *
 * PropertyType.Number:
 * - A numerical input.
 *
 * PropertyType.DateTime:
 * - An input for date and time.
 *
 * PropertyType.Measure:
 * - Combines a value and unit of measure.
 *
 * PropertyType.Options:
 * - A dropdown or multi-select input.
 * - Requires an `options` array.
 * - Can be multi-select if `multiSelect` is set to true.
 *
 * PropertyType.RefNameString:
 * - A reference name input, often used for linked data.
 *
 * PropertyType.StratigraphicStruct:
 * - For complex stratigraphic structure inputs.
 *
 * PropertyType.Boolean:
 * - A dropdown input for boolean values.
 *
 * PropertyType.List:
 * - An input for a list of items.
 * - Requires `subProps` defining the properties of list items.
 */
export enum PropertyType {
  String,
  StringNumber,
  Number,
  DateTime,
  Measure,
  Options,
  RefNameString,
  StratigraphicStruct,
  Boolean,
  List
}
