import { validText } from "components/Modals/ModalParts";

it("Should detect any misbehavior during text validation using the validText() method.", () => {
  expect(validText(null)).toBeFalsy();
  expect(validText(null, 0)).toBeTruthy();
  expect(validText(undefined, 0)).toBeTruthy();
  expect(validText(null, 0, 10)).toBeTruthy();
  expect(validText(undefined, 0, 10)).toBeTruthy();
  expect(validText(null, 1)).toBeFalsy();
  expect(validText(undefined, 1)).toBeFalsy();
  expect(validText(null, 1, 10)).toBeFalsy();
  expect(validText(undefined, 1, 10)).toBeFalsy();
  expect(validText("")).toBeFalsy();
  expect(validText("", 0, null)).toBeTruthy();
  expect(validText("a", 0, null)).toBeTruthy();
  expect(validText("a", 1, null)).toBeTruthy();
  expect(validText("", 1, null)).toBeFalsy();
  expect(validText("abc", null, 3)).toBeTruthy();
  expect(validText("abcd", null, 3)).toBeFalsy();
  expect(validText("ab", 1, 3)).toBeTruthy();
  expect(validText("abc", 1, 3)).toBeTruthy();
  expect(validText("", 1, 3)).toBeFalsy();
  expect(validText("abcd", 1, 3)).toBeFalsy();
  expect(validText("a", 1, 1)).toBeTruthy();
  expect(validText("aa", 1, 1)).toBeFalsy();
  expect(() => {
    validText("abc", 3, 1);
  }).toThrow("The value for minLength should be less than maxLength.");
});
