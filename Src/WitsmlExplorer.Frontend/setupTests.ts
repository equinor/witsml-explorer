import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend(matchers);
//temporary solution to workaround innapropriate types from @testing-library/jest-dom/vitest out of runtime
declare module "vitest" {
    interface Assertion<T = any> extends Matchers.TestingLibraryMatchers<T, void> {}
}
