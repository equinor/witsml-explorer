import "@testing-library/jest-dom/extend-expect";
import { act, screen, within } from "@testing-library/react";
import { mockEdsCoreReact } from "__testUtils__/mocks/EDSMocks";
import {
  MockResizeObserver,
  deferred,
  getJobInfo,
  getNotification,
  renderWithContexts
} from "__testUtils__/testUtils";
import { ReportModal } from "components/Modals/ReportModal";
import JobInfo from "models/jobs/jobInfo";
import { createReport } from "models/reports/BaseReport";
import JobService from "services/jobService";
import NotificationService from "services/notificationService";

jest.mock("services/objectService");
jest.mock("@microsoft/signalr");
jest.mock("@equinor/eds-core-react", () => mockEdsCoreReact());

jest.mock("services/jobService", () => {
  return {
    getUserJobInfo: () => {
      const jobInfo: JobInfo = {
        isCancelable: false,
        jobType: "",
        description: "",
        id: "",
        username: "",
        witsmlTargetUsername: "",
        witsmlSourceUsername: "",
        sourceServer: "",
        targetServer: "",
        wellName: "",
        wellboreName: "",
        objectName: "",
        startTime: "",
        endTime: "",
        killTime: "",
        status: "",
        failedReason: "",
        report: null
      };
      const jobInfoArray: JobInfo[] = [];
      jobInfoArray[0] = jobInfo;
      return {
        jobInfos: jobInfoArray
      };
    }
  };
});

describe("Report Modal", () => {
  //mock ResizeObserver to enable testing virtualized components
  window.ResizeObserver = MockResizeObserver;

  describe("Report Modal with report", () => {
    it("Should show a basic report", () => {
      renderWithContexts(<ReportModal report={REPORT} />);
      expect(screen.getByText(REPORT.title)).toBeInTheDocument();
      expect(screen.getByText(REPORT.summary)).toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("Should be able to show a report without reportItems", () => {
      renderWithContexts(<ReportModal report={EMPTY_REPORT} />);
      expect(screen.getByText(EMPTY_REPORT.title)).toBeInTheDocument();
      expect(screen.getByText(EMPTY_REPORT.summary)).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("Should show the reportItems in a table", () => {
      renderWithContexts(<ReportModal report={REPORT} />);
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(REPORT_ITEMS.length + 1); // An extra row for the header

      // Test that the header has the keys as values in each cell
      const headerCells = within(rows[0]).getAllByRole("button"); // header cells are buttons to toggle sorting
      expect(headerCells).toHaveLength(Object.keys(REPORT_ITEMS[0]).length);
      Object.keys(REPORT_ITEMS[0]).forEach((key, cellIndex) => {
        expect(
          within(headerCells[cellIndex]).getByText(key)
        ).toBeInTheDocument();
      });

      // Test the data
      REPORT_ITEMS.forEach((reportItem, rowIndex) => {
        const cells = within(rows[rowIndex + 1]).getAllByRole("cell");
        expect(cells).toHaveLength(Object.keys(reportItem).length + 2); // +2 because ContentTable adds an extra column before and after
        Object.values(reportItem).forEach((value, cellIndex) => {
          expect(
            within(cells[cellIndex + 1]).getByText(value)
          ).toBeInTheDocument(); // +1 for the same reason
        });
      });
    });
  });

  describe("Report Modal with jobId", () => {
    it("Should show a loading screen when provided with a jobId of an unfinished job", () => {
      renderWithContexts(<ReportModal jobId="testJobId" />);
      expect(screen.getByText(/loading report/i)).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("Should show the report once the job has finished", async () => {
      const { promise: jobInfoPromise, resolve: resolveJobInfoPromise } =
        deferred<JobInfo>();

      jest
        .spyOn(JobService, "getUserJobInfo")
        .mockImplementation(() => jobInfoPromise);

      renderWithContexts(<ReportModal jobId="testJobId" />);
      expect(screen.getByText(/loading report/i)).toBeInTheDocument();

      // Send the mocked notification signal
      NotificationService.Instance.snackbarDispatcher.dispatch(NOTIFICATION);

      // A notification that the job has finished has been received. It should still display loading until the job is fetched.
      expect(screen.getByText(/loading report/i)).toBeInTheDocument();
      expect(JobService.getUserJobInfo).toHaveBeenCalledTimes(2);

      // Resolve and return from the mocked getUserJobInfo
      await act(async () => {
        resolveJobInfoPromise(JOB_INFO);
      });

      expect(screen.queryByText(/loading report/i)).not.toBeInTheDocument();
      expect(screen.getByText(REPORT.title)).toBeInTheDocument();
      expect(screen.getByText(REPORT.summary)).toBeInTheDocument();
    });
  });
});

const REPORT_ITEMS = [
  {
    field1: "value1_a",
    field2: "value1_b",
    field3: "value1_c"
  },
  {
    field1: "value2_a",
    field2: "value2_b",
    field3: "value2_c"
  },
  {
    field1: "value3_a",
    field2: "value3_b",
    field3: "value3_c"
  }
];

const REPORT = createReport("testTitle", "testSummary", REPORT_ITEMS);
const EMPTY_REPORT = createReport("emptyReportTitle", "emptyReportSummary");
const JOB_INFO = getJobInfo({ report: REPORT, id: "testJobId" });
const NOTIFICATION = getNotification({ jobId: "testJobId" });
