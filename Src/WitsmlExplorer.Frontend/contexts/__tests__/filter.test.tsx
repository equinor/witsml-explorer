import { getLogObject } from "../../__testUtils__/testUtils";
import LogObject from "../../models/logObject";
import Well from "../../models/well";
import Wellbore from "../../models/wellbore";
import { EMPTY_FILTER, Filter, FilterOptions, filterWells } from "../filter";

describe("Filter", () => {
  let filter: Filter;
  let wells: Well[];

  beforeEach(() => {
    filter = EMPTY_FILTER;
    wells = [
      { ...WELL_1, wellbores: [WELLBORE_1A, WELLBORE_1B, WELLBORE_1C] },
      { ...WELL_2, wellbores: [WELLBORE_2A, WELLBORE_2B] },
      { ...WELL_3, wellbores: [WELLBORE_3A, WELLBORE_3B, WELLBORE_3C, WELLBORE_3D] },
      { ...WELL_4, wellbores: [WELLBORE_4A] },
      { ...WELL_5, wellbores: [WELLBORE_5A, WELLBORE_5B] }
    ];
  });

  describe("Filter wells", () => {
    const testCases = [EMPTY_FILTER, null, undefined];
    testCases.forEach((testCase) => {
      it(`Should not filter if filter is invalid or empty. Testing: ${testCase}`, () => {
        filter = testCase;
        const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
        expect(modifiedWells).toStrictEqual(wells);
      });
    });
  });

  describe("Filter on wellName", () => {
    it("Should filter on exact wellName", () => {
      filter.name = "Well 1";
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_1];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should filter on partial wellName", () => {
      filter.name = "2";
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should ignore casing when filtering on wellName", () => {
      filter.name = "wElL ";
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      expect(modifiedWells).toStrictEqual(wells);
    });

    const testCasesForInvalidInput = ["", null, undefined];
    testCasesForInvalidInput.forEach((testCase) => {
      it(`Should not filter if wellName is invalid or false. Testing: ${testCase}`, () => {
        filter.name = testCase;
        const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
        expect(wells).toStrictEqual(modifiedWells);
      });
    });
  });

  describe("Filter on isActive", () => {
    it("Should keep only active wells and wellbores", () => {
      filter.isActive = true;
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [
        { ...WELL_2, wellbores: [WELLBORE_2A, WELLBORE_2B] },
        { ...WELL_3, wellbores: [WELLBORE_3A, WELLBORE_3C] }
      ];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    const testCasesForInvalidInput = [false, null, undefined];
    testCasesForInvalidInput.forEach((testCase) => {
      it(`Should not filter if isActive is invalid or false. Testing: ${testCase}`, () => {
        filter.isActive = testCase;
        const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
        expect(wells).toStrictEqual(modifiedWells);
      });
    });
  });

  describe("Filter on objectGrowing", () => {
    it("Should only keep growing logs", () => {
      filter.objectGrowing = true;
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [
        { ...WELL_1, wellbores: [{ ...WELLBORE_1A, logs: [LOG_1A1] }, WELLBORE_1B, WELLBORE_1C] },
        { ...WELL_2, wellbores: [{ ...WELLBORE_2A, logs: [LOG_2A2, LOG_2A3] }, WELLBORE_2B] },
        WELL_3,
        WELL_4,
        WELL_5
      ];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    const testCasesForInvalidInput = [false, null, undefined];
    testCasesForInvalidInput.forEach((testCase) => {
      it(`Should not filter if objectGrowing is invalid or false. Testing: ${testCase}`, () => {
        filter.objectGrowing = testCase;
        const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
        expect(wells).toStrictEqual(modifiedWells);
      });
    });
  });

  describe("Filter on wellLimit", () => {
    const testCasesForValidInput = [1, 2, 3, 4];
    testCasesForValidInput.forEach((testCase) => {
      it(`Should filter number of wells based on wellLimit. Testing: ${testCase}`, () => {
        filter.wellLimit = testCase;
        const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
        expect(modifiedWells.length).toEqual(filter.wellLimit);
      });
    });

    const testCasesForInvalidInput = [0, null, undefined, -1, -2, -100, 10, 100];
    testCasesForInvalidInput.forEach((testCase) => {
      it(`Should not filter if wellLimit is invalid, non-positive or bigger than number of wells. Testing: ${testCase}`, () => {
        filter.wellLimit = testCase;
        const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
        expect(wells).toStrictEqual(modifiedWells);
      });
    });
  });

  describe("Filter wildcards", () => {
    it("Should match wellName using wildcard '*'", () => {
      filter.name = "We*2";
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should match wellName using wildcard '?' for a single character", () => {
      filter.name = "Wel? 2";
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should match all 'Well X' using wildcard '?' for a single character", () => {
      filter.name = "Well ?";
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_1, WELL_2, WELL_3, WELL_4, WELL_5];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should match wellName using combination of wildcards", () => {
      filter.name = "W?ll*2";
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });
  });

  describe("Filter options", () => {
    it("Should only match on wellName when matchOnlyWell is true", () => {
      filter.name = "Well*1";
      const modifiedWells = filterWells(wells, filter, {
        ...FILTER_OPTIONS,
        matchOnlyWell: true
      });
      const expectedWells = [WELL_1];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should only match on both wellName and wellboreName when matchOnlyWell is false", () => {
      filter.name = "Well*1";
      const modifiedWells = filterWells(wells, filter, {
        ...FILTER_OPTIONS,
        matchOnlyWell: false
      });
      const expectedWells = [WELL_1, WELL_5];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should filter on wellName and wellboreName when filterWellbores is true", () => {
      filter.name = "Well*1";
      const modifiedWells = filterWells(wells, filter, {
        ...FILTER_OPTIONS,
        matchOnlyWell: false,
        filterWellbores: true
      });
      const expectedWells = [WELL_1, { ...WELL_5, wellbores: [WELLBORE_5A] }];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });
  });
});

const LOG_1A1: LogObject = getLogObject({ uid: "log1A1", wellUid: "well1", wellboreUid: "wellbore1A", name: "Log 1A1", objectGrowing: true });
const LOG_1A2: LogObject = getLogObject({ uid: "log1A2", wellUid: "well1", wellboreUid: "wellbore1A", name: "Log 1A2", objectGrowing: false });

const LOG_2A1: LogObject = getLogObject({ uid: "log2A1", wellUid: "well2", wellboreUid: "wellbore2A", name: "Log 2A1", objectGrowing: false });
const LOG_2A2: LogObject = getLogObject({ uid: "log2A2", wellUid: "well2", wellboreUid: "wellbore2A", name: "Log 2A2", objectGrowing: true });
const LOG_2A3: LogObject = getLogObject({ uid: "log2A3", wellUid: "well2", wellboreUid: "wellbore2A", name: "Log 2A3", objectGrowing: true });

const WELLBORE_1A: Wellbore = {
  uid: "wellbore1A",
  wellUid: "well1",
  name: "Wellbore 1A",
  logs: [LOG_1A1, LOG_1A2],
  rigs: [],
  trajectories: [],
  wellStatus: "",
  wellType: "",
  isActive: false
};
const WELLBORE_1B: Wellbore = { uid: "wellbore1B", wellUid: "well1", name: "Wellbore 1B", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: false };
const WELLBORE_1C: Wellbore = { uid: "wellbore1C", wellUid: "well1", name: "Wellbore 1C", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: false };

const WELLBORE_2A: Wellbore = {
  uid: "wellbore2A",
  wellUid: "well2",
  name: "Wellbore 2A",
  logs: [LOG_2A1, LOG_2A2, LOG_2A3],
  rigs: [],
  trajectories: [],
  wellStatus: "",
  wellType: "",
  isActive: true
};
const WELLBORE_2B: Wellbore = { uid: "wellbore2B", wellUid: "well2", name: "Wellbore 2B", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: true };

const WELLBORE_3A: Wellbore = { uid: "wellbore3A", wellUid: "well3", name: "Wellbore 3A", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: true };
const WELLBORE_3B: Wellbore = { uid: "wellbore3B", wellUid: "well3", name: "Wellbore 3B", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: false };
const WELLBORE_3C: Wellbore = { uid: "wellbore3C", wellUid: "well3", name: "Wellbore 3C", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: true };
const WELLBORE_3D: Wellbore = { uid: "wellbore3D", wellUid: "well3", name: "Wellbore 3D", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: false };

const WELLBORE_4A: Wellbore = { uid: "wellbore4A", wellUid: "well4", name: "Wellbore 4A", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: false };

const WELLBORE_5A: Wellbore = { uid: "wellbore5A", wellUid: "well5", name: "Wellbore 5A1", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: false };
const WELLBORE_5B: Wellbore = { uid: "wellbore5B", wellUid: "well5", name: "Wellbore 5B", logs: [], rigs: [], trajectories: [], wellStatus: "", wellType: "", isActive: false };

const WELL_1: Well = { uid: "well1", name: "Well 1", wellbores: [WELLBORE_1A, WELLBORE_1B, WELLBORE_1C], field: "", operator: "", country: "" };
const WELL_2: Well = { uid: "well2", name: "Well 2", wellbores: [WELLBORE_2A, WELLBORE_2B], field: "", operator: "", country: "" };
const WELL_3: Well = { uid: "well3", name: "Well 3", wellbores: [WELLBORE_3A, WELLBORE_3B, WELLBORE_3C, WELLBORE_3D], field: "", operator: "", country: "" };
const WELL_4: Well = { uid: "well4", name: "Well 4", wellbores: [WELLBORE_4A], field: "", operator: "", country: "" };
const WELL_5: Well = { uid: "well5", name: "Well 5", wellbores: [WELLBORE_5A, WELLBORE_5B], field: "", operator: "", country: "" };

const FILTER_OPTIONS: FilterOptions = {
  matchOnlyWell: false,
  filterWellbores: false
};
