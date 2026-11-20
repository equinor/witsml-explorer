import { Server } from "models/server";
import { ApiClient } from "services/apiClient";

export const UPLOAD_CHUNK_SIZE = 8 * 1024 * 1024;
const MAX_CHUNK_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export interface UploadInfo {
  uploadId: string;
  fileName: string;
  totalSize: number;
  receivedBytes: number;
}

export default class UploadService {
  /**
   * Uploads a file to the server in resumable chunks and returns the id of the completed upload.
   * Only one chunk is held in memory at a time, so arbitrarily large files can be uploaded.
   */
  public static async uploadFile(
    file: File,
    server: Server,
    onProgress?: (receivedBytes: number) => void,
    abortSignal: AbortSignal | null = null,
    chunkSize: number = UPLOAD_CHUNK_SIZE
  ): Promise<string> {
    // Let creation return its ID so an immediate cancellation can still clean up.
    const upload = await this.createUpload(file, server);
    try {
      let offset = upload.receivedBytes;
      abortSignal?.throwIfAborted();
      onProgress?.(offset);
      while (offset < file.size) {
        const end = Math.min(offset + chunkSize, file.size);
        offset = await this.sendChunk(
          upload.uploadId,
          file.slice(offset, end),
          offset,
          server,
          abortSignal
        );
        onProgress?.(offset);
      }
      abortSignal?.throwIfAborted();
      return upload.uploadId;
    } catch (error) {
      await this.deleteUpload(upload.uploadId, server).catch((cleanupError) => {
        console.warn("Could not remove temporary LAS upload", cleanupError);
      });
      throw error;
    }
  }

  public static async createUpload(
    file: File,
    server: Server
  ): Promise<UploadInfo> {
    const response = await ApiClient.requestAtServer("/api/uploads", server, {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, totalSize: file.size }),
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok) {
      throw new Error(await this.getErrorMessage(response));
    }
    return response.json();
  }

  public static async getUpload(
    uploadId: string,
    server: Server,
    abortSignal: AbortSignal | null = null
  ): Promise<UploadInfo> {
    const response = await ApiClient.requestAtServer(
      `/api/uploads/${uploadId}`,
      server,
      { signal: abortSignal }
    );
    if (!response.ok) {
      throw new Error(await this.getErrorMessage(response));
    }
    return response.json();
  }

  public static async deleteUpload(
    uploadId: string,
    server: Server
  ): Promise<void> {
    const response = await ApiClient.requestAtServer(
      `/api/uploads/${uploadId}`,
      server,
      { method: "DELETE", signal: AbortSignal.timeout(10_000) }
    );
    if (!response.ok && response.status !== 404) {
      throw new Error(await this.getErrorMessage(response));
    }
  }

  /**
   * Sends a chunk, retrying transient failures. Returns the number of bytes the server has received.
   * If the server reports an offset mismatch (e.g. a retried chunk that was in fact stored),
   * the upload continues from the offset the server knows about.
   */
  private static async sendChunk(
    uploadId: string,
    chunk: Blob,
    offset: number,
    server: Server,
    abortSignal: AbortSignal | null
  ): Promise<number> {
    let lastError: Error = null;
    for (let attempt = 1; attempt <= MAX_CHUNK_ATTEMPTS; attempt++) {
      try {
        abortSignal?.throwIfAborted();
        const response = await ApiClient.requestAtServer(
          `/api/uploads/${uploadId}/chunks?offset=${offset}`,
          server,
          { method: "POST", body: chunk, signal: abortSignal }
        );
        if (response.ok) {
          const info: UploadInfo = await response.json();
          return info.receivedBytes;
        }
        if (response.status === 409) {
          const info = await this.getUpload(uploadId, server, abortSignal);
          if (info.receivedBytes > offset) return info.receivedBytes;
          throw new Error(`Unexpected upload offset: ${info.receivedBytes}.`);
        }
        lastError = new Error(await this.getErrorMessage(response));
        if (response.status < 500) {
          throw lastError;
        }
      } catch (error) {
        if (error.name === "AbortError" || error === lastError) {
          throw error;
        }
        lastError = error;
      }
      if (attempt < MAX_CHUNK_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempt)
        );
      }
    }
    throw lastError;
  }

  private static async getErrorMessage(response: Response): Promise<string> {
    try {
      const body = await response.json();
      if (body?.message) return body.message;
    } catch {
      // Ignore, use the default message below.
    }
    return `Upload failed with status ${response.status}`;
  }
}
