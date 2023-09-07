import { validText } from "../ModalParts";

it("Should detect any misbehavior during text validation using the validText() method.", () => {
  expect(validText("")).toBeFalsy();
  expect(validText("", 0, undefined)).toBeTruthy();
  expect(validText("a", 0, undefined)).toBeTruthy();
  expect(validText("a", 1, undefined)).toBeTruthy();
  expect(validText("", 1, undefined)).toBeFalsy();
  expect(validText("abc", undefined, 3)).toBeTruthy();
  expect(validText("abcd", undefined, 3)).toBeFalsy();
  expect(validText("ab", 1, 3)).toBeTruthy();
  expect(validText("abc", 1, 3)).toBeTruthy();
  expect(validText("", 1, 3)).toBeFalsy();
  expect(validText("abcd", 1, 3)).toBeFalsy();
  expect(() => {
    validText("abc", 1, 1);
  }).toThrow("The value for minLength should be less than maxLength.");
  expect(() => {
    validText("abc", 3, 1);
  }).toThrow("The value for minLength should be less than maxLength.");
});
