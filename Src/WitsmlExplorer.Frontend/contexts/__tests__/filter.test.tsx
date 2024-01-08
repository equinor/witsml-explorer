import {
  getLogObject,
  getObjectSearchResult,
  getWell,
  getWellbore
} from "__testUtils__/testUtils";
import {
  EMPTY_FILTER,
  Filter,
  FilterOptions,
  ObjectFilterType,
  WellFilterType,
  WellPropertyFilterType,
  filterTypeToProperty,
  filterWells
} from "contexts/filter";
import LogObject from "models/logObject";
import Well from "models/well";
import Wellbore from "models/wellbore";

describe("Filter", () => {
  let filter: Filter;
  let wells: Well[];

  beforeEach(() => {
    filter = EMPTY_FILTER;
    wells = [
      { ...WELL_1, wellbores: [WELLBORE_1A, WELLBORE_1B, WELLBORE_1C] },
      { ...WELL_2, wellbores: [WELLBORE_2A, WELLBORE_2B] },
      {
        ...WELL_3,
        wellbores: [WELLBORE_3A, WELLBORE_3B, WELLBORE_3C, WELLBORE_3D]
      },
      { ...WELL_4, wellbores: [WELLBORE_4A] },
      { ...WELL_5, wellbores: [WELLBORE_5A, WELLBORE_5B] },
      { ...WELL_6, wellbores: [WELLBORE_6] }
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
        {
          ...WELL_1,
          wellbores: [
            { ...WELLBORE_1A, logs: [LOG_1A1] },
            WELLBORE_1B,
            WELLBORE_1C
          ]
        },
        {
          ...WELL_2,
          wellbores: [{ ...WELLBORE_2A, logs: [LOG_2A2, LOG_2A3] }, WELLBORE_2B]
        },
        WELL_3,
        WELL_4,
        WELL_5,
        WELL_6
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

    const testCasesForInvalidInput = [
      0,
      null,
      undefined,
      -1,
      -2,
      -100,
      10,
      100
    ];
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
      const expectedWells = [WELL_1, WELL_2, WELL_3, WELL_4, WELL_5, WELL_6];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should match wellName using combination of wildcards", () => {
      filter.name = "W?ll*2";
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });
  });

  describe("Filter Type", () => {
    it("Should only match on wellName when FilterType is Well", () => {
      filter.name = "Well*1";
      filter.filterType = WellFilterType.Well;
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_1];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should match on both wellName and wellboreName when FilterType is WellOrWellbore", () => {
      filter.name = "Well*1";
      filter.filterType = WellFilterType.WellOrWellbore;
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_1, WELL_5];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should only match on field when FilterType is Field", () => {
      filter.name = "testField";
      filter.filterType = WellPropertyFilterType.Field;
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_5];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should only match on numLicense when FilterType is License", () => {
      filter.name = "543";
      filter.filterType = WellPropertyFilterType.License;
      const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
      const expectedWells = [WELL_6];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    Object.values(ObjectFilterType).forEach((filterType) => {
      it(`Should match on ${filterTypeToProperty[filterType]} property when FilterType is ${filterType}`, () => {
        filter.name = `test${filterTypeToProperty[filterType]}`;
        filter.filterType = filterType;
        filter.searchResults = [
          getObjectSearchResult({
            wellUid: "well6",
            wellboreUid: "wellbore6",
            searchProperty: `test${filterTypeToProperty[filterType]}`
          })
        ];
        const modifiedWells = filterWells(wells, filter, FILTER_OPTIONS);
        const expectedWells = [WELL_6];
        expect(modifiedWells).toStrictEqual(expectedWells);
      });
    });
  });

  describe("Filter options", () => {
    it("Should remove any wellbores that doesn't match when filterWellbores is true", () => {
      filter.name = "Well*1";
      filter.filterType = WellFilterType.WellOrWellbore;
      const modifiedWells = filterWells(wells, filter, {
        ...FILTER_OPTIONS,
        filterWellbores: true
      });
      const expectedWells = [WELL_1, { ...WELL_5, wellbores: [WELLBORE_5A] }];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should not remove any wellbores (but still keep wells that matches) when filterWellbores is false", () => {
      filter.name = "Well*1";
      filter.filterType = WellFilterType.WellOrWellbore;
      const modifiedWells = filterWells(wells, filter, {
        ...FILTER_OPTIONS,
        filterWellbores: false
      });
      const expectedWells = [WELL_1, WELL_5];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });
  });
});

const LOG_1A1: LogObject = getLogObject({
  uid: "log1A1",
  wellUid: "well1",
  wellboreUid: "wellbore1A",
  name: "Log 1A1",
  objectGrowing: true
});
const LOG_1A2: LogObject = getLogObject({
  uid: "log1A2",
  wellUid: "well1",
  wellboreUid: "wellbore1A",
  name: "Log 1A2",
  objectGrowing: false
});

const LOG_2A1: LogObject = getLogObject({
  uid: "log2A1",
  wellUid: "well2",
  wellboreUid: "wellbore2A",
  name: "Log 2A1",
  objectGrowing: false
});
const LOG_2A2: LogObject = getLogObject({
  uid: "log2A2",
  wellUid: "well2",
  wellboreUid: "wellbore2A",
  name: "Log 2A2",
  objectGrowing: true
});
const LOG_2A3: LogObject = getLogObject({
  uid: "log2A3",
  wellUid: "well2",
  wellboreUid: "wellbore2A",
  name: "Log 2A3",
  objectGrowing: true
});

const WELLBORE_1A: Wellbore = getWellbore({
  uid: "wellbore1A",
  wellUid: "well1",
  name: "Wellbore 1A",
  logs: [LOG_1A1, LOG_1A2],
  isActive: false
});
const WELLBORE_1B: Wellbore = getWellbore({
  uid: "wellbore1B",
  wellUid: "well1",
  name: "Wellbore 1B",
  isActive: false
});
const WELLBORE_1C: Wellbore = getWellbore({
  uid: "wellbore1C",
  wellUid: "well1",
  name: "Wellbore 1C",
  isActive: false
});

const WELLBORE_2A: Wellbore = getWellbore({
  uid: "wellbore2A",
  wellUid: "well2",
  name: "Wellbore 2A",
  logs: [LOG_2A1, LOG_2A2, LOG_2A3],
  isActive: true
});
const WELLBORE_2B: Wellbore = getWellbore({
  uid: "wellbore2B",
  wellUid: "well2",
  name: "Wellbore 2B",
  isActive: true
});

const WELLBORE_3A: Wellbore = getWellbore({
  uid: "wellbore3A",
  wellUid: "well3",
  name: "Wellbore 3A",
  isActive: true
});
const WELLBORE_3B: Wellbore = getWellbore({
  uid: "wellbore3B",
  wellUid: "well3",
  name: "Wellbore 3B",
  isActive: false
});
const WELLBORE_3C: Wellbore = getWellbore({
  uid: "wellbore3C",
  wellUid: "well3",
  name: "Wellbore 3C",
  isActive: true
});
const WELLBORE_3D: Wellbore = getWellbore({
  uid: "wellbore3D",
  wellUid: "well3",
  name: "Wellbore 3D",
  isActive: false
});

const WELLBORE_4A: Wellbore = getWellbore({
  uid: "wellbore4A",
  wellUid: "well4",
  name: "Wellbore 4A",
  isActive: false
});

const WELLBORE_5A: Wellbore = getWellbore({
  uid: "wellbore5A",
  wellUid: "well5",
  name: "Wellbore 5A1",
  isActive: false
});
const WELLBORE_5B: Wellbore = getWellbore({
  uid: "wellbore5B",
  wellUid: "well5",
  name: "Wellbore 5B",
  isActive: false
});

const WELLBORE_6: Wellbore = getWellbore({
  uid: "wellbore6",
  wellUid: "well6",
  name: "Wellbore 6",
  isActive: false
});

const WELL_1: Well = getWell({
  uid: "well1",
  name: "Well 1",
  wellbores: [WELLBORE_1A, WELLBORE_1B, WELLBORE_1C]
});
const WELL_2: Well = getWell({
  uid: "well2",
  name: "Well 2",
  wellbores: [WELLBORE_2A, WELLBORE_2B]
});
const WELL_3: Well = getWell({
  uid: "well3",
  name: "Well 3",
  wellbores: [WELLBORE_3A, WELLBORE_3B, WELLBORE_3C, WELLBORE_3D]
});
const WELL_4: Well = getWell({
  uid: "well4",
  name: "Well 4",
  wellbores: [WELLBORE_4A]
});
const WELL_5: Well = getWell({
  uid: "well5",
  name: "Well 5",
  field: "testField",
  wellbores: [WELLBORE_5A, WELLBORE_5B]
});
const WELL_6: Well = getWell({
  uid: "well6",
  name: "Well 6",
  numLicense: "543",
  wellbores: [WELLBORE_6]
});

const FILTER_OPTIONS: FilterOptions = {
  filterWellbores: false
};
