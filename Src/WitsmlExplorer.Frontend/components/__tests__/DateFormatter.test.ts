import { TimeZone } from "../../contexts/operationStateReducer";
import formatDateString from "../DateFormatter";

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
  expect(actual).toEqual("2022-11-17T05:54:17.000");
});
