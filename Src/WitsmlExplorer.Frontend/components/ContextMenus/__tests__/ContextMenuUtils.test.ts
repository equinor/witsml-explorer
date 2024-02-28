import { menuItemText } from "components/ContextMenus/ContextMenuUtils";

const ARRAY_LENGTH_2 = ["", ""];
const ARRAY_LENGTH_1 = [""];

it("Should correctly pluralize words ending with y", () => {
  expect(menuItemText("Copy", "trajectory", ARRAY_LENGTH_2)).toStrictEqual(
    "Copy 2 trajectories"
  );
});

it("Should correctly pluralize words not ending with y", () => {
  expect(menuItemText("Copy", "tubular", ARRAY_LENGTH_2)).toStrictEqual(
    "Copy 2 tubulars"
  );
});

it("Should not pluralize words ending with y given a single object", () => {
  expect(menuItemText("Copy", "trajectory", ARRAY_LENGTH_1)).toStrictEqual(
    "Copy 1 trajectory"
  );
});

it("Should not pluralize words not ending with y given a single object", () => {
  expect(menuItemText("Copy", "tubular", ARRAY_LENGTH_1)).toStrictEqual(
    "Copy 1 tubular"
  );
});

it("Should not show count when not given an array", () => {
  expect(menuItemText("Copy", "trajectory", null)).toStrictEqual(
    "Copy trajectory"
  );
});

it("Should use defined capitalization", () => {
  expect(menuItemText("cOPY", "tRAJECTORY", null)).toStrictEqual(
    "Copy trajectory"
  );
});

it("Should use defined capitalization when plural", () => {
  expect(menuItemText("cOPY", "bhaRun", ARRAY_LENGTH_2)).toStrictEqual(
    "Copy 2 bharuns"
  );
});
