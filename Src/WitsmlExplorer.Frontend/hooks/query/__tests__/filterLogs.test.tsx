import { getLogObject } from "../../../__testUtils__/testUtils";
import { EMPTY_FILTER, Filter } from "../../../contexts/filter";
import LogObject from "../../../models/logObject";
import { ObjectType } from "../../../models/objectType";
import { filterObjects } from "../../useObjectFilter";

describe("Filter Logs", () => {
  let filter: Filter;
  let logs: LogObject[];

  beforeEach(() => {
    filter = EMPTY_FILTER;
    logs = [LOG_1, LOG_2];
  });

  describe("Filter on objectGrowing", () => {
    it("Should only keep growing logs", () => {
      filter.objectGrowing = true;
      const modifiedLogs = filterObjects(logs, ObjectType.Log, filter);
      const expectedLogs = [LOG_1];
      expect(modifiedLogs).toStrictEqual(expectedLogs);
    });

    const testCasesForInvalidInput = [false, null, undefined];
    testCasesForInvalidInput.forEach((testCase) => {
      it(`Should not filter if objectGrowing is invalid or false. Testing: ${testCase}`, () => {
        filter.objectGrowing = testCase;
        const modifiedLogs = filterObjects(logs, ObjectType.Log, filter);
        expect(logs).toStrictEqual(modifiedLogs);
      });
    });
  });
});

const LOG_1: LogObject = getLogObject({
  uid: "log1",
  wellUid: "well1",
  wellboreUid: "wellbore1",
  name: "Log 1",
  objectGrowing: true
});
const LOG_2: LogObject = getLogObject({
  uid: "log1",
  wellUid: "well1",
  wellboreUid: "wellbore1",
  name: "Log 1",
  objectGrowing: false
});
