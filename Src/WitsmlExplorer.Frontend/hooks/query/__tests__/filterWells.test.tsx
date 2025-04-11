import {
  getObjectSearchResult,
  getWell
} from "../../../__testUtils__/testUtils";
import {
  EMPTY_FILTER,
  Filter,
  ObjectFilterType,
  WellFilterType,
  WellPropertyFilterType,
  filterTypeToProperty
} from "../../../contexts/filter";
import Well from "../../../models/well";
import { filterWells } from "../../useWellFilter";
import { UidMappingBasicInfo } from "../../../models/uidMapping.tsx";

describe("Filter Wells", () => {
  let filter: Filter;
  let wells: Well[];

  beforeEach(() => {
    filter = { ...EMPTY_FILTER };
    wells = [WELL_1, WELL_2, WELL_3, WELL_4, WELL_5, WELL_6];
  });

  describe("Filter wells", () => {
    const testCases = [EMPTY_FILTER, null, undefined];
    testCases.forEach((testCase) => {
      it(`Should not filter if filter is invalid or empty. Testing: ${testCase}`, () => {
        filter = testCase;
        const modifiedWells = filterWells(wells, [], filter);
        expect(modifiedWells).toStrictEqual(wells);
      });
    });
  });

  describe("Filter on wellName", () => {
    it("Should filter on exact wellName", () => {
      filter.name = "Well 1";
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_1];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should filter on partial wellName", () => {
      filter.name = "2";
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should ignore casing when filtering on wellName", () => {
      filter.name = "wElL ";
      const modifiedWells = filterWells(wells, [], filter);
      expect(modifiedWells).toStrictEqual(wells);
    });

    const testCasesForInvalidInput = ["", null, undefined];
    testCasesForInvalidInput.forEach((testCase) => {
      it(`Should not filter if wellName is invalid or false. Testing: ${testCase}`, () => {
        filter.name = testCase;
        const modifiedWells = filterWells(wells, [], filter);
        expect(wells).toStrictEqual(modifiedWells);
      });
    });
  });

  describe("Filter on isActive", () => {
    it("Should keep only active wells", () => {
      filter.isActive = true;
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_2, WELL_3];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    const testCasesForInvalidInput = [false, null, undefined];
    testCasesForInvalidInput.forEach((testCase) => {
      it(`Should not filter if isActive is invalid or false. Testing: ${testCase}`, () => {
        filter.isActive = testCase;
        const modifiedWells = filterWells(wells, [], filter);
        expect(wells).toStrictEqual(modifiedWells);
      });
    });
  });

  describe("Filter on uidMapping", () => {
    it("Should keep only wells with UID mapped wellbores", () => {
      filter.uidMapping = true;
      const basicInfo = { sourceWellId: WELL_6.uid } as UidMappingBasicInfo;
      const modifiedWells = filterWells(wells, [basicInfo], filter);
      const expectedWells = [WELL_6];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });
  });

  describe("Filter wildcards", () => {
    it("Should match wellName using wildcard '*'", () => {
      filter.name = "We*2";
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should match wellName using wildcard '?' for a single character", () => {
      filter.name = "Wel? 2";
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should match all 'Well X' using wildcard '?' for a single character", () => {
      filter.name = "Well ?";
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_1, WELL_2, WELL_3, WELL_4, WELL_5, WELL_6];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should match wellName using combination of wildcards", () => {
      filter.name = "W?ll*2";
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_2];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });
  });

  describe("Filter Type", () => {
    it("Should only match on wellName when FilterType is Well", () => {
      filter.name = "Well*1";
      filter.filterType = WellFilterType.Well;
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_1];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should only match on field when FilterType is Field", () => {
      filter.name = "testField";
      filter.filterType = WellPropertyFilterType.Field;
      const modifiedWells = filterWells(wells, [], filter);
      const expectedWells = [WELL_5];
      expect(modifiedWells).toStrictEqual(expectedWells);
    });

    it("Should only match on numLicense when FilterType is License", () => {
      filter.name = "543";
      filter.filterType = WellPropertyFilterType.License;
      const modifiedWells = filterWells(wells, [], filter);
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
        const modifiedWells = filterWells(wells, [], filter);
        const expectedWells = [WELL_6];
        expect(modifiedWells).toStrictEqual(expectedWells);
      });
    });
  });
});

const WELL_1: Well = getWell({
  uid: "well1",
  name: "Well 1"
});
const WELL_2: Well = getWell({
  uid: "well2",
  name: "Well 2",
  isActive: true
});
const WELL_3: Well = getWell({
  uid: "well3",
  name: "Well 3",
  isActive: true
});
const WELL_4: Well = getWell({
  uid: "well4",
  name: "Well 4"
});
const WELL_5: Well = getWell({
  uid: "well5",
  name: "Well 5",
  field: "testField"
});
const WELL_6: Well = getWell({
  uid: "well6",
  name: "Well 6",
  numLicense: "543"
});
