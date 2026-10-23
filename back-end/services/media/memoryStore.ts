import { objectLocation } from "./keys";
import { ObjectStore, StoredPart } from "./objectStore";

type Saved = { body: Buffer; mime: string };

export function memoryObjectStore(bucket = "test-bucket"): ObjectStore & { saved: Map<string, Saved> } {
  const saved = new Map<string, Saved>();
  const uploads = new Map<string, { key: string; mime: string; parts: Map<number, Buffer> }>();

  return {
    saved,
    async putObject({ key, body, mime }) {
      saved.set(key, { body: Buffer.from(body), mime });
      return { location: objectLocation(bucket, key) };
    },
    async startMultipart({ key, mime }) {
      const uploadId = `up-${uploads.size + 1}`;
      uploads.set(uploadId, { key, mime, parts: new Map() });
      return { uploadId };
    },
    async uploadPart({ uploadId, partNumber, body }) {
      const upload = uploads.get(uploadId);
      if (!upload) throw new Error("Unknown multipart upload");
      upload.parts.set(partNumber, Buffer.from(body));
      return { etag: `etag-${partNumber}` };
    },
    async completeMultipart({ key, uploadId, parts }) {
      const upload = uploads.get(uploadId);
      if (!upload || upload.key !== key) throw new Error("Unknown multipart upload");
      const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber);
      const body = Buffer.concat(ordered.map((part) => upload.parts.get(part.partNumber) || Buffer.alloc(0)));
      saved.set(key, { body, mime: upload.mime });
      uploads.delete(uploadId);
      return { location: objectLocation(bucket, key) };
    },
    async abortMultipart({ uploadId }) {
      uploads.delete(uploadId);
    },
    async openObject(key) {
      const item = saved.get(key);
      if (!item) throw new Error("Object not found");
      return {
        size: item.body.length,
        mime: item.mime,
        read: async (start, end) => item.body.subarray(start, end + 1),
      };
    },
  };
}

export type { StoredPart };
