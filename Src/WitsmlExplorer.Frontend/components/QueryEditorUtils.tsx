import { Ace } from "ace-builds";
import { TemplateObjects } from "components/ContentViews/QueryViewUtils";
import { templates } from "templates/templates";

/**
 * Custom commands for QueryEditor.
 */
export const customCommands = [
  {
    name: "newLineBelow",
    bindKey: { win: "Shift-Enter", mac: "Shift-Enter" },
    exec: (editor: any) => {
      editor.selection.moveCursorLineEnd();
      editor.insert("\n");
    },
    multiSelectAction: "forEach"
  }
];

interface Completion {
  caption: string;
  snippet: string;
  score?: number;
}

/**
 * Custom autocomplete for QueryEditor.
 */
export const customCompleter = {
  getCompletions: (
    editor: any,
    // @ts-ignore
    session: Ace.EditSession,
    pos: Ace.Point,
    // @ts-ignore
    prefix: string,
    callback: (error: any, results: Completion[]) => void
  ) => {
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
export const getTag = (str: string): string => {
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
    const tag = getTag(row)?.slice(0, -1);
    if (
      tag &&
      Object.values(TemplateObjects).includes(tag as TemplateObjects)
    ) {
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
 * @param fullLine - Wheter to return the full line, or only the tag (default).
 * @returns The parent tag (or full line of text), or null if not found.
 */
export const getParentTag = (
  rows: string[],
  currentRow: number,
  fullLine: boolean = false
): string => {
  const openTags = [];
  for (let index = 0; index < currentRow; index++) {
    const tag = getTag(rows[index]);
    if (tag && !rows[index].includes("</") && !rows[index].includes("/>")) {
      openTags.push(fullLine ? rows[index] : tag);
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

  // Insert snippet
  const lead = editor.selection.lead;
  const prefix = editor.session.getLine(lead.row).substring(0, lead.column);
  let snippet = data.snippet;
  if (prefix.trim().startsWith("<")) {
    snippet = snippet.substring(1);
  }
  editor.insertSnippet(snippet);

  // Move cursor to the correct position
  if (snippet.includes("><")) {
    const charactersFromEnd = snippet.length - snippet.indexOf("><") - 1;
    editor.execCommand({
      exec: () => {
        editor.selection.moveCursorBy(0, -charactersFromEnd);
      },
      multiSelectAction: "forEach"
    });
  } else if (/\n\t*\n/.test(snippet)) {
    const rowsFromEnd = snippet
      .split("\n")
      .reverse()
      .findIndex((row) => row.trim() === "");
    editor.execCommand({
      exec: () => {
        editor.selection.moveCursorBy(-rowsFromEnd, 0);
        editor.selection.moveCursorLineEnd();
      },
      multiSelectAction: "forEach"
    });
  }
};

/**
 * Completion for the root objects.
 */
const objectsCompletions: Completion[] = Object.values(TemplateObjects).map(
  (templateObject) => {
    const uidString =
      templateObject === TemplateObjects.Well
        ? 'uid=""'
        : templateObject === TemplateObjects.Wellbore
        ? 'uidWell="" uid=""'
        : 'uidWell="" uidWellbore="" uid=""';
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
  }
);

/**
 * Generates completion for direct children of the parentObject using the template of templateObject.
 *
 * @param templateObject - The template object for which to generate completions.
 * @param parentObject - The parent object's tag.
 * @returns An array of completion objects.
 */
const getCompletionsForObject = (
  templateObject: TemplateObjects,
  parentObject: string
): Completion[] => {
  const template = templates[templateObject];
  const rows = template.split("\n");
  const completions = [];
  for (let index = 0; index < rows.length; index++) {
    if (getParentTag(rows, index) === parentObject) {
      const tag = getTag(rows[index]);
      const isClosingTag = /^\s*<\//.test(rows[index]);
      if (!tag || isClosingTag) continue;
      const shouldAddNewline = !rows[index].includes("/>");
      completions.push({
        caption: tag,
        snippet: `${rows[index].trim().replace(" /", "")}${
          shouldAddNewline ? "\n\t\n" : ""
        }</${tag}>`,
        completer: {
          insertMatch: customInsertMatch
        }
      });
    }
  }
  return completions;
};
