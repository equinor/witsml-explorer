import { TimeZone } from "../../contexts/operationStateReducer";
import formatDateString, { validateIsoDateString } from "../DateFormatter";

it("Should replace +00:00 with Z when TimeZone is Raw", () => {
  const actual = formatDateString("2022-11-17T13:54:17.000+00:00", TimeZone.Raw);
  expect(actual).toEqual("2022-11-17T13:54:17.000Z");
});

it("Should keep the offset when TimeZone is Raw", () => {
  const actual = formatDateString("2022-11-17T13:54:17.000+01:00", TimeZone.Raw);
  expect(actual).toEqual("2022-11-17T13:54:17.000+01:00");
});

it("Should convert the time when a specific TimeZone is picked", () => {
  const actual = formatDateString("2022-11-17T13:54:17.000+02:00", TimeZone.Houston);
  expect(actual).toEqual("2022-11-17T05:54:17.000-06:00");
});

it("Should validate offset with minus", () => {
  const actual = validateIsoDateString("2022-11-17T13:54:17.000\u{2212}02:00");
  expect(actual).toEqual(true);
});

it("Should validate offset with hyphen minus", () => {
  const actual = validateIsoDateString("2022-11-17T13:54:17.000-02:00");
  expect(actual).toEqual(true);
});

it("Should validate offset with plus", () => {
  const actual = validateIsoDateString("2022-11-17T13:54:17.000+02:00");
  expect(actual).toEqual(true);
});

it("Should invalidate a string without offset", () => {
  const actual = validateIsoDateString("2022-11-17T13:54:17.000");
  expect(actual).toEqual(false);
});

it("Should invalidate missing milliseconds", () => {
  const actual = validateIsoDateString("2022-11-17T13:00:00+02:00");
  expect(actual).toEqual(false);
});

it("Should invalidate bad seconds", () => {
  const actual = validateIsoDateString("2022-11-17T13:00:67.000+02:00");
  expect(actual).toEqual(false);
});

it("Should invalidate bad minutes", () => {
  const actual = validateIsoDateString("2022-11-17T13:74:00.000+02:00");
  expect(actual).toEqual(false);
});

it("Should invalidate bad hours", () => {
  const actual = validateIsoDateString("2022-11-17T25:00:00.000+02:00");
  expect(actual).toEqual(false);
});

it("Should invalidate bad days", () => {
  const actual = validateIsoDateString("2022-11-32T00:00:00.000+02:00");
  expect(actual).toEqual(false);
});

it("Should invalidate bad leap year", () => {
  const actual = validateIsoDateString("2022-02-29T00:00:00.000+02:00");
  expect(actual).toEqual(false);
});

it("Should validate good leap year", () => {
  const actual = validateIsoDateString("2020-02-29T00:00:00.000+02:00");
  expect(actual).toEqual(true);
});

it("Should invalidate bad month", () => {
  const actual = validateIsoDateString("2022-13-01T01:00:00.000+02:00");
  expect(actual).toEqual(false);
});

it("Should validate string with Z", () => {
  const actual = validateIsoDateString("2022-12-01T01:00:00.000Z");
  expect(actual).toEqual(true);
});

it("Should validate string with +00:00", () => {
  const actual = validateIsoDateString("2022-12-01T01:00:00.000+00:00");
  expect(actual).toEqual(true);
});

it("Should invalidate a string with bad negative offset", () => {
  const actual = validateIsoDateString("2022-11-17T13:54:17.000-25:00");
  expect(actual).toEqual(false);
});

it("Should invalidate a string with bad positive offset", () => {
  const actual = validateIsoDateString("2022-11-17T13:54:17.000+25:00");
  expect(actual).toEqual(false);
});
