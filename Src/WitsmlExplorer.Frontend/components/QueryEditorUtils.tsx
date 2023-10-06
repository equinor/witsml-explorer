import { Ace } from "ace-builds";
import { templates } from "../templates/templates";
import { TemplateObjects } from "./ContentViews/QueryViewUtils";

interface Completion {
  caption: string;
  snippet: string;
  score?: number;
}

/**
 * Custom autocomplete for QueryEditor.
 */
export const customCompleter = {
  getCompletions: (editor: any, session: Ace.EditSession, pos: Ace.Point, prefix: string, callback: (error: any, results: Completion[]) => void) => {
    const currentValue = editor.getValue();
    const rows = currentValue.split("\n");
    if (rows[pos.row].includes(">")) return;

    // If there are no tags yet, suggest the root objects
    if (!currentValue.includes(">")) {
      callback(null, objectsCompletions);
      return;
    }

    // Suggest objects based on the parent tag
    const templateObject: TemplateObjects = getTemplateObject(rows);
    if (templateObject) {
      const parentTag: string = getParentTag(rows, pos.row);
      if (parentTag) {
        callback(null, getCompletionsForObject(templateObject, parentTag));
      }
    }
  }
};

/**
 * Extracts the tag from a XML string.
 * Example: '<well uid="" />' returns well
 *
 * @param str - The input XML string.
 * @returns The tag found in the input string.
 */
const getTag = (str: string): string => {
  return str.match(/<\/*(\w+)[^>]*>/)?.[1];
};

/**
 * Determines the template object based on rows of xml strings.
 *
 * @param rows - An array of strings representing xml content.
 * @returns The template object (if found) or null.
 */
const getTemplateObject = (rows: string[]): TemplateObjects | null => {
  for (const row of rows) {
    const tag = getTag(row).slice(0, -1);
    if (tag && Object.values(TemplateObjects).includes(tag as TemplateObjects)) {
      return tag as TemplateObjects;
    }
  }
  return null;
};

/**
 * Finds the parent tag for a given row in the xml list.
 *
 * @param rows - An array of strings representing xml content.
 * @param currentRow - The row number for which to find the parent tag.
 * @returns The parent tag or null if not found.
 */
const getParentTag = (rows: string[], currentRow: number): string => {
  const openTags = [];
  for (let index = 0; index < currentRow; index++) {
    const tag = getTag(rows[index]);
    if (tag && !rows[index].includes("</") && !rows[index].includes("/>")) {
      openTags.push(tag);
    }
    if (tag && /^\s*<\//.test(rows[index])) {
      openTags.pop();
    }
  }
  if (openTags) {
    return openTags[openTags.length - 1];
  }
  return null;
};

/**
 * Inserts a completion snippet into the editor and moves the cursor to the correct position.
 */
const customInsertMatch = (editor: any, data: Completion) => {
  // Remove the current text that overlaps with the snippet
  if (editor.completer.completions.filterText) {
    const ranges = editor.selection.getAllRanges();
    for (const range of ranges) {
      range.start.column -= editor.completer.completions.filterText.length;
      editor.session.remove(range);
    }
  }

  const lead = editor.selection.lead;
  const currentRow = lead.row;
  const currentColumn = lead.column;
  const isMultiLine = editor.selection.getAllRanges().length > 1;

  // Insert snippet
  const prefix = editor.session.getLine(currentRow).substring(0, currentColumn);
  let snippet = data.snippet;
  if (prefix.trim().startsWith("<")) {
    snippet = snippet.substring(1);
  }
  editor.insertSnippet(snippet);

  // Move cursor to the correct position
  if (!isMultiLine) {
    if (snippet.includes("><")) {
      const snippetColumn = snippet.indexOf("><");
      editor.gotoLine(currentRow + 1, currentColumn + snippetColumn + 1, true);
    } else if (/\n\t*\n/.test(snippet)) {
      const snippetRows = snippet.split("\n");
      for (let index = 0; index < snippetRows.length; index++) {
        if (snippetRows[index].trim() == "") {
          const snippetColumn = (snippetRows[index].match(/\t/g) || []).length * 2;
          editor.gotoLine(currentRow + index + 1, currentColumn + snippetColumn, true);
          break;
        }
      }
    }
  }
};

/**
 * Completion for the root objects.
 */
const objectsCompletions: Completion[] = Object.values(TemplateObjects).map((templateObject) => {
  const uidString = templateObject == TemplateObjects.Well ? 'uid=""' : templateObject == TemplateObjects.Wellbore ? 'uidWell="" uid=""' : 'uidWell="" uidWellbore="" uid=""';
  return {
    caption: `${templateObject}s`,
    snippet:
      `<${templateObject}s xmlns = "http://www.witsml.org/schemas/1series" version = "1.4.1.1">\n` +
      `\t<${templateObject} ${uidString}>\n` +
      `\t\t\n` +
      `\t</${templateObject}>\n` +
      `</${templateObject}s>`,
    completer: {
      insertMatch: customInsertMatch
    }
  };
});

/**
 * Generates completion for direct children of the parentObject using the template of templateObject.
 *
 * @param templateObject - The template object for which to generate completions.
 * @param parentObject - The parent object's tag.
 * @returns An array of completion objects.
 */
const getCompletionsForObject = (templateObject: TemplateObjects, parentObject: string): Completion[] => {
  const template = templates[templateObject];
  const rows = template.split("\n");
  const completions = [];
  for (let index = 0; index < rows.length; index++) {
    if (getParentTag(rows, index) == parentObject) {
      const tag = getTag(rows[index]);
      const isClosingTag = /^\s*<\//.test(rows[index]);
      if (!tag || isClosingTag) continue;
      const shouldAddNewline = !rows[index].includes("/>");
      completions.push({
        caption: tag,
        snippet: `${rows[index].trim().replace(" /", "")}${shouldAddNewline ? "\n\t\n" : ""}</${tag}>`,
        completer: {
          insertMatch: customInsertMatch
        }
      });
    }
  }
  return completions;
};
