import { getIndexRanges } from "../table";
import LogObject from "../../../models/logObject";

const logObject: LogObject = {
  uid: "",
  name: "",
  wellUid: "",
  wellName: "",
  wellboreUid: "",
  wellboreName: "",
  indexType: "",
  startIndex: "",
  endIndex: "",
  indexCurve: "DEP"
};

const checkedRows: any[] = [
  { id: 7, DEP: 70, MNEM: 700 },
  { id: 2, DEP: 20, MNEM: 200 },
  { id: 3, DEP: 30, MNEM: 300 },
  { id: 1, DEP: 10, MNEM: 100 },
  { id: 6, DEP: 60, MNEM: 600 },
  { id: 8, DEP: 80, MNEM: 800 }
];

describe("VirtualizedContentTable - getIndexRanges", () => {
  it("Return two indexRange....", () => {
    const range = getIndexRanges(checkedRows, logObject);
    expect(range).toHaveLength(2);
    expect(range[0].startIndex).toBe("10");
    expect(range[0].endIndex).toBe("30");
    expect(range[1].startIndex).toBe("60");
    expect(range[1].endIndex).toBe("80");
  });
});
