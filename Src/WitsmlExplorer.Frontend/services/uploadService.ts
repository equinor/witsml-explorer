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
    onProgress?: (fraction: number) => void,
    abortSignal: AbortSignal | null = null,
    chunkSize: number = UPLOAD_CHUNK_SIZE
  ): Promise<string> {
    const upload = await this.createUpload(file, abortSignal);
    try {
      let offset = upload.receivedBytes;
      onProgress?.(file.size === 0 ? 1 : offset / file.size);
      while (offset < file.size) {
        const end = Math.min(offset + chunkSize, file.size);
        offset = await this.sendChunk(
          upload.uploadId,
          file.slice(offset, end),
          offset,
          abortSignal
        );
        onProgress?.(offset / file.size);
      }
      return upload.uploadId;
    } catch (error) {
      await this.deleteUpload(upload.uploadId).catch(() => undefined);
      throw error;
    }
  }

  public static async createUpload(
    file: File,
    abortSignal: AbortSignal | null = null
  ): Promise<UploadInfo> {
    const response = await ApiClient.post(
      "/api/uploads",
      JSON.stringify({ fileName: file.name, totalSize: file.size }),
      abortSignal
    );
    if (!response.ok) {
      throw new Error(await this.getErrorMessage(response));
    }
    return response.json();
  }

  public static async getUpload(
    uploadId: string,
    abortSignal: AbortSignal | null = null
  ): Promise<UploadInfo> {
    const response = await ApiClient.get(
      `/api/uploads/${uploadId}`,
      abortSignal
    );
    if (!response.ok) {
      throw new Error(await this.getErrorMessage(response));
    }
    return response.json();
  }

  public static async deleteUpload(uploadId: string): Promise<void> {
    await ApiClient.delete(`/api/uploads/${uploadId}`);
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
    abortSignal: AbortSignal | null
  ): Promise<number> {
    let lastError: Error = null;
    for (let attempt = 1; attempt <= MAX_CHUNK_ATTEMPTS; attempt++) {
      try {
        const response = await ApiClient.postBinary(
          `/api/uploads/${uploadId}/chunks?offset=${offset}`,
          chunk,
          abortSignal
        );
        if (response.ok) {
          const info: UploadInfo = await response.json();
          return info.receivedBytes;
        }
        if (response.status === 409) {
          const info = await this.getUpload(uploadId, abortSignal);
          return info.receivedBytes;
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
