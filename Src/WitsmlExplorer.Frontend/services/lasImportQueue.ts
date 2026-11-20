import JobStatus from "models/jobStatus";
import ImportLasFileJob from "models/jobs/importLasFileJob";
import JobInfo from "models/jobs/jobInfo";
import { Server } from "models/server";
import { ApiClient } from "services/apiClient";
import { JobType } from "services/jobService";
import UploadService from "services/uploadService";

type Phase =
  | "queued"
  | "uploading"
  | "cancelling"
  | "submitting"
  | "waitingForImport"
  | "importing"
  | "completed"
  | "failed"
  | "cancelled"
  | "trackingPaused"
  | "submissionUnknown"
  | "skipped";

type ImportOptions = Omit<ImportLasFileJob, "uploadId">;

export interface LasImportItem {
  id: number;
  fileName: string;
  totalBytes: number;
  receivedBytes: number;
  etaSeconds?: number;
  serverName: string;
  logName: string;
  phase: Phase;
  jobId?: string;
  importProgress?: number;
  error?: string;
}

interface QueueInput {
  file: File;
  server: Server;
  options: ImportOptions;
}

const isResolved = (item: LasImportItem) =>
  item.phase === "completed" ||
  item.phase === "cancelled" ||
  item.phase === "skipped";

export class LasImportQueue {
  private items: LasImportItem[] = [];
  private nextId = 0;
  private inputs = new Map<number, QueueInput>();
  private listeners = new Set<() => void>();
  private running = false;
  private uploadController?: AbortController;

  public getSnapshot = () => this.items;

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public enqueue(file: File, server: Server, options: ImportOptions) {
    const id = ++this.nextId;
    this.inputs.set(id, { file, server: { ...server }, options });
    this.publish([
      ...this.items,
      {
        id,
        fileName: file.name,
        serverName: server.name || server.url,
        logName: options.targetLog.name,
        phase: "queued",
        receivedBytes: 0,
        totalBytes: file.size
      }
    ]);
    void this.process();
  }

  public cancel(id: number) {
    const item = this.items.find((entry) => entry.id === id);
    if (item?.phase === "queued") {
      this.inputs.delete(id);
      this.update(id, { phase: "cancelled" });
    } else if (item?.phase === "uploading") {
      this.update(id, { phase: "cancelling" });
      this.uploadController?.abort();
    }
  }

  public retry(id: number) {
    const item = this.items.find((entry) => entry.id === id);
    if (item?.phase === "failed") {
      this.update(id, {
        phase: "queued",
        receivedBytes: 0,
        jobId: undefined,
        importProgress: undefined,
        etaSeconds: undefined,
        error: undefined
      });
    } else if (item?.phase === "trackingPaused") {
      this.update(id, { phase: "waitingForImport", error: undefined });
    } else {
      return;
    }
    void this.process();
  }

  public skip(id: number) {
    if (this.items.find((item) => item.id === id)?.phase !== "failed") return;
    this.inputs.delete(id);
    this.update(id, { phase: "skipped" });
    void this.process();
  }

  public clearFinished() {
    this.publish(this.items.filter((item) => !isResolved(item)));
  }

  private publish(items: LasImportItem[]) {
    this.items = items;
    this.listeners.forEach((listener) => listener());
  }

  private update(id: number, patch: Partial<LasImportItem>) {
    this.publish(
      this.items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  private async process() {
    if (this.running) return;
    this.running = true;
    try {
      let item = this.items.find((entry) => !isResolved(entry));
      while (
        item &&
        (item.phase === "queued" || item.phase === "waitingForImport")
      ) {
        const input = this.inputs.get(item.id);
        const jobId =
          item.jobId ?? (await this.uploadAndSubmit(item.id, input));
        if (jobId) await this.trackImport(item.id, jobId, input.server);
        item = this.items.find((entry) => !isResolved(entry));
      }
    } finally {
      this.running = false;
    }
  }

  private async uploadAndSubmit(
    id: number,
    { file, server, options }: QueueInput
  ) {
    const controller = new AbortController();
    this.uploadController = controller;
    this.update(id, { phase: "uploading" });
    let uploadId: string;
    let lastBytes = 0;
    let lastTime = performance.now();
    let speed = 0;
    try {
      uploadId = await UploadService.uploadFile(
        file,
        server,
        (receivedBytes) => {
          if (controller.signal.aborted || receivedBytes <= lastBytes) return;
          const now = performance.now();
          const sample =
            (receivedBytes - lastBytes) / Math.max(1, now - lastTime);
          speed = speed ? 0.7 * speed + 0.3 * sample : sample;
          lastTime = now;
          lastBytes = receivedBytes;
          this.update(id, {
            receivedBytes,
            etaSeconds: Math.ceil((file.size - receivedBytes) / speed / 1000)
          });
        },
        controller.signal
      );
      if (controller.signal.aborted) {
        await UploadService.deleteUpload(uploadId, server);
        controller.signal.throwIfAborted();
      }
    } catch (error) {
      if (controller.signal.aborted) {
        this.inputs.delete(id);
        this.update(id, { phase: "cancelled", etaSeconds: undefined });
      } else {
        this.update(id, { phase: "failed", error: message(error) });
      }
      return;
    } finally {
      this.uploadController = undefined;
    }

    this.update(id, { phase: "submitting", etaSeconds: undefined });
    try {
      const job: ImportLasFileJob = { ...options, uploadId };
      const response = await ApiClient.requestAtServer(
        `/api/jobs/${JobType.ImportLasFile}`,
        server,
        {
          method: "POST",
          body: JSON.stringify(job),
          signal: AbortSignal.timeout(30_000)
        }
      );
      if (!response.ok) {
        const error = `Could not submit the import job (HTTP ${response.status}).`;
        if (response.status < 500 && response.status !== 408) {
          await UploadService.deleteUpload(uploadId, server).catch(
            (cleanupError) => {
              console.warn(
                "Could not remove temporary LAS upload",
                cleanupError
              );
            }
          );
          this.update(id, { phase: "failed", error });
          return;
        }
        throw new Error(error);
      }
      const jobId: unknown = await response.json();
      if (typeof jobId !== "string" || !jobId) {
        throw new Error("The server did not return an import job ID.");
      }
      this.update(id, { phase: "waitingForImport", jobId });
      return jobId;
    } catch (error) {
      this.update(id, {
        phase: "submissionUnknown",
        error: `${message(
          error
        )} Check the Jobs view before restarting. The import may already be running.`
      });
    }
  }

  private async trackImport(id: number, jobId: string, server: Server) {
    try {
      for (;;) {
        const response = await ApiClient.requestAtServer(
          `/api/jobs/userjobinfo/${encodeURIComponent(jobId)}`,
          server,
          { signal: AbortSignal.timeout(15_000) }
        );
        if (!response.ok) {
          throw new Error(
            `Could not check the import job (HTTP ${response.status}).`
          );
        }
        const job: JobInfo = await response.json();
        switch (job.status) {
          case JobStatus.Finished:
            this.inputs.delete(id);
            this.update(id, { phase: "completed", importProgress: 1 });
            return;
          case JobStatus.Failed:
          case JobStatus.Cancelled:
            this.update(id, {
              phase: "failed",
              error: `${
                job.failedReason || `Import job ${job.status.toLowerCase()}.`
              } Some rows may already have been written.`
            });
            return;
          case JobStatus.Queued:
          case JobStatus.Started:
            this.update(id, {
              phase:
                job.status === JobStatus.Queued
                  ? "waitingForImport"
                  : "importing",
              importProgress: Math.min(0.99, job.progress ?? 0)
            });
            break;
          default:
            throw new Error(
              "The server returned an unknown import job status."
            );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      this.update(id, { phase: "trackingPaused", error: message(error) });
    }
  }
}

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const lasImportQueue = new LasImportQueue();
