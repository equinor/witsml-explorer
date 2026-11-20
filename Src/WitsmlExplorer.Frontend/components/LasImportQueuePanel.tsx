import { Box, Button, LinearProgress, Paper, Typography } from "@mui/material";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LasImportItem, lasImportQueue } from "services/lasImportQueue";

const labels: Record<LasImportItem["phase"], string> = {
  queued: "Queued",
  uploading: "Uploading",
  cancelling: "Cancelling upload",
  submitting: "Submitting import",
  waitingForImport: "Waiting for import job",
  importing: "Writing to server",
  completed: "Completed",
  failed: "Failed - queue paused",
  cancelled: "Upload cancelled",
  trackingPaused: "Job status unavailable - queue paused",
  submissionUnknown: "Job submission unconfirmed - queue paused",
  skipped: "Skipped"
};

export const AUTO_CLOSE_DELAY_MS = 5000;

const percent = (fraction: number) => Math.floor(fraction * 100);
const isFinished = ({ phase }: LasImportItem) =>
  phase === "completed" || phase === "cancelled" || phase === "skipped";

export default function LasImportQueuePanel() {
  const items = useSyncExternalStore(
    lasImportQueue.subscribe,
    lasImportQueue.getSnapshot
  );
  const [expanded, setExpanded] = useState(true);
  const allFinished = items.length > 0 && items.every(isFinished);

  useEffect(() => {
    if (!allFinished) return;
    const timeout = setTimeout(
      () => lasImportQueue.clearFinished(),
      AUTO_CLOSE_DELAY_MS
    );
    return () => clearTimeout(timeout);
  }, [items, allFinished]);

  if (!items.length) return null;

  const active = items.find((item) => !isFinished(item));
  const uploaded = items.filter(
    ({ phase, receivedBytes, totalBytes }) =>
      phase !== "cancelled" && totalBytes > 0 && receivedBytes >= totalBytes
  ).length;

  return (
    <Paper
      component="section"
      aria-label="LAS import queue"
      elevation={6}
      sx={{
        position: "fixed",
        right: 16,
        bottom: 16,
        width: "min(400px, calc(100vw - 32px))",
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Typography variant="subtitle1" component="h2">
            LAS import queue
          </Typography>
          <Button
            size="small"
            aria-expanded={expanded}
            aria-controls={expanded ? "las-import-queue-items" : undefined}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </Box>
        <Typography variant="body2">
          {uploaded}/{items.length} handled
          {active ? ` - ${labels[active.phase]}` : ""}
        </Typography>
      </Box>
      {expanded && (
        <Box
          id="las-import-queue-items"
          sx={{ maxHeight: "42vh", overflowY: "auto" }}
        >
          {items.map((item) => (
            <QueueRow key={item.id} item={item} />
          ))}
          {allFinished && (
            <Button
              size="small"
              sx={{ m: 1 }}
              onClick={() => lasImportQueue.clearFinished()}
            >
              Close
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
}

function QueueRow({ item }: { item: LasImportItem }) {
  const { phase, id, fileName, serverName, logName } = item;
  const isUploading = phase === "uploading" || phase === "cancelling";
  const progress = isUploading
    ? percent(item.totalBytes > 0 ? item.receivedBytes / item.totalBytes : 0)
    : phase === "importing"
    ? percent(item.importProgress ?? 0)
    : undefined;

  return (
    <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: "divider" }}>
      <Typography variant="body2" noWrap title={fileName}>
        {fileName}
      </Typography>
      <Typography
        variant="caption"
        component="div"
        noWrap
        title={`${serverName} / ${logName}`}
      >
        {serverName} / {logName}
      </Typography>
      <Typography variant="body2">
        {labels[phase]}
        {progress !== undefined ? `: ${progress}%` : ""}
        {phase === "uploading" && item.etaSeconds > 0
          ? ` - about ${
              item.etaSeconds < 60
                ? `${item.etaSeconds}s`
                : `${Math.ceil(item.etaSeconds / 60)} min`
            } left`
          : ""}
      </Typography>
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          aria-label={`${labels[phase]} ${fileName}`}
        />
      )}
      {item.error && (
        <Typography variant="caption" color="error" component="p">
          {item.error}
        </Typography>
      )}
      {(phase === "queued" || phase === "uploading") && (
        <Button size="small" onClick={() => lasImportQueue.cancel(id)}>
          {phase === "queued" ? "Remove from queue" : "Cancel upload"}
        </Button>
      )}
      {(phase === "failed" || phase === "trackingPaused") && (
        <Button size="small" onClick={() => lasImportQueue.retry(id)}>
          {phase === "trackingPaused" ? "Resume tracking" : "Retry file"}
        </Button>
      )}
      {phase === "failed" && (
        <Button size="small" onClick={() => lasImportQueue.skip(id)}>
          Skip file
        </Button>
      )}
    </Box>
  );
}
