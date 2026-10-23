import crypto from "crypto";
import http from "http";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { isJournalKey, isMissingObject, keyFromLocation, safeFileName } from "./keys";
import { ObjectStore } from "./objectStore";

export const DEFAULT_CHUNK_SIZE = 256 * 1024;
export const DEFAULT_PART_SIZE = 5 * 1024 * 1024;
export const DEFAULT_MAX_BYTES = 200 * 1024 * 1024;

const ALLOWED_MIME: Record<string, "image" | "video"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
};

type MediaUser = { id: string };

export type MediaServerOptions = {
  store: ObjectStore;
  authenticate: (token: string) => Promise<MediaUser | null>;
  bucket?: string;
  chunkSize?: number;
  partSize?: number;
  maxBytes?: number;
};

type Upload = {
  id: string;
  key: string;
  mime: string;
  kind: "image" | "video";
  size: number;
  received: number;
  stored: number;
  pending: Buffer;
  uploadId?: string;
  parts: { partNumber: number; etag: string }[];
  nextPart: number;
};

function asBuffer(data: RawData): Buffer {
  if (Array.isArray(data)) return Buffer.concat(data);
  if (Buffer.isBuffer(data)) return data;
  return Buffer.from(data);
}

export function attachMediaServer(server: http.Server, options: MediaServerOptions): WebSocketServer {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const partSize = options.partSize ?? DEFAULT_PART_SIZE;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const bucket = options.bucket || process.env.AWS_S3_BUCKET_NAME || "";
  const wss = new WebSocketServer({ server, path: "/media" });

  wss.on("connection", (socket) => {
    let user: MediaUser | null = null;
    let upload: Upload | null = null;
    let busy = Promise.resolve();

    const send = (message: Record<string, unknown>) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    };

    const fail = async (message: string) => {
      if (upload?.uploadId) {
        await options.store.abortMultipart({ key: upload.key, uploadId: upload.uploadId }).catch(() => undefined);
      }
      upload = null;
      send({ op: "error", message });
    };

    const progress = (phase: "received" | "stored" | "sending", current: Upload | { id: string; stored: number; size: number }, loaded: number) => {
      send({
        op: "progress",
        transferId: current.id,
        direction: phase === "sending" ? "download" : "upload",
        phase,
        loaded,
        stored: current.stored,
        total: current.size,
      });
    };

    const drain = async (current: Upload, final: boolean) => {
      const needsMultipart = current.size >= partSize;
      if (needsMultipart && !current.uploadId) {
        const started = await options.store.startMultipart({ key: current.key, mime: current.mime });
        current.uploadId = started.uploadId;
      }
      while (current.pending.length >= partSize) {
        const body = Buffer.from(current.pending.subarray(0, partSize));
        current.pending = Buffer.from(current.pending.subarray(partSize));
        const part = await options.store.uploadPart({
          key: current.key,
          uploadId: current.uploadId as string,
          partNumber: current.nextPart,
          body,
        });
        current.parts.push({ partNumber: current.nextPart, etag: part.etag });
        current.nextPart += 1;
        current.stored += body.length;
        progress("stored", current, current.received);
      }
      if (!final) return;
      if (current.received !== current.size) {
        throw new Error("The upload ended before every chunk arrived.");
      }
      if (current.uploadId) {
        if (current.pending.length > 0) {
          const body = current.pending;
          current.pending = Buffer.alloc(0);
          const part = await options.store.uploadPart({
            key: current.key,
            uploadId: current.uploadId,
            partNumber: current.nextPart,
            body,
          });
          current.parts.push({ partNumber: current.nextPart, etag: part.etag });
          current.stored += body.length;
          progress("stored", current, current.received);
        }
        const done = await options.store.completeMultipart({
          key: current.key,
          uploadId: current.uploadId,
          parts: current.parts,
        });
        return done.location;
      }
      const done = await options.store.putObject({
        key: current.key,
        body: current.pending,
        mime: current.mime,
      });
      current.pending = Buffer.alloc(0);
      current.stored = current.received;
      progress("stored", current, current.received);
      return done.location;
    };

    const onMessage = async (data: RawData, isBinary: boolean) => {
      if (isBinary) {
        if (!upload) {
          send({ op: "error", message: "Start an upload before sending chunks." });
          return;
        }
        const chunk = asBuffer(data);
        if (chunk.length > chunkSize) {
          await fail("That chunk is larger than the socket allows.");
          return;
        }
        if (upload.received + chunk.length > upload.size) {
          await fail("The upload is larger than the size you announced.");
          return;
        }
        upload.pending = Buffer.concat([upload.pending, chunk]);
        upload.received += chunk.length;
        progress("received", upload, upload.received);
        await drain(upload, false);
        return;
      }

      const text = asBuffer(data).toString("utf8");
      let message: { op?: string; token?: string; name?: string; mime?: string; size?: number; url?: string };
      try {
        message = JSON.parse(text) as typeof message;
      } catch {
        send({ op: "error", message: "That message is not JSON." });
        return;
      }

      if (!user) {
        if (message.op !== "hello" || !message.token) {
          socket.close(4001, "Please log in first.");
          return;
        }
        user = await options.authenticate(message.token);
        if (!user) {
          socket.close(4001, "Please log in first.");
          return;
        }
        send({ op: "ready", chunkSize });
        return;
      }

      if (message.op === "upload-start") {
        if (upload) {
          send({ op: "error", message: "Finish the current upload first." });
          return;
        }
        const mime = String(message.mime || "");
        const kind = ALLOWED_MIME[mime];
        const size = Number(message.size);
        if (!kind || !Number.isInteger(size) || size < 1 || size > maxBytes) {
          send({
            op: "error",
            message: "Choose a photo or video under 200 MB. Accepted types are JPEG, PNG, WEBP, GIF, MP4, WEBM, and MOV.",
          });
          return;
        }
        upload = {
          id: crypto.randomUUID(),
          key: `journals/${user.id}/${crypto.randomUUID()}-${safeFileName(String(message.name || "media"))}`,
          mime,
          kind,
          size,
          received: 0,
          stored: 0,
          pending: Buffer.alloc(0),
          parts: [],
          nextPart: 1,
        };
        send({ op: "upload-ready", transferId: upload.id, key: upload.key, chunkSize });
        return;
      }

      if (message.op === "upload-finish") {
        if (!upload) {
          send({ op: "error", message: "There is no upload to finish." });
          return;
        }
        const current = upload;
        const location = await drain(current, true);
        upload = null;
        send({
          op: "upload-done",
          transferId: current.id,
          url: location,
          key: current.key,
          mime: current.mime,
          kind: current.kind,
        });
        return;
      }

      if (message.op === "upload-abort") {
        await fail("Upload cancelled.");
        return;
      }

      if (message.op === "download-start") {
        if (upload) {
          send({ op: "error", message: "Finish the upload before downloading." });
          return;
        }
        const key = keyFromLocation(String(message.url || ""), bucket);
        if (!key || !isJournalKey(key)) {
          send({ op: "error", message: "That file is not a journal photo or video." });
          return;
        }
        let object;
        try {
          object = await options.store.openObject(key);
        } catch (error) {
          send({
            op: "error",
            message: isMissingObject(error) ? "That file is not in storage." : "Could not open that file.",
          });
          return;
        }
        const transferId = crypto.randomUUID();
        let loaded = 0;
        while (loaded < object.size) {
          const end = Math.min(loaded + chunkSize, object.size) - 1;
          const next = end + 1;
          send({
            op: "progress",
            transferId,
            direction: "download",
            phase: "sending",
            loaded: next,
            stored: next,
            total: object.size,
          });
          const piece = await object.read(loaded, end);
          loaded = next;
          if (socket.readyState === WebSocket.OPEN) socket.send(piece);
        }
        send({ op: "download-done", transferId, key, mime: object.mime, size: object.size });
        return;
      }

      send({ op: "error", message: "Unknown media command." });
    };

    socket.on("message", (data, isBinary) => {
      busy = busy
        .then(() => onMessage(data, isBinary))
        .catch(async (error: unknown) => {
          const message = error instanceof Error ? error.message : "The media transfer failed.";
          await fail(message);
        });
    });

    socket.on("close", () => {
      if (upload?.uploadId) {
        void options.store.abortMultipart({ key: upload.key, uploadId: upload.uploadId }).catch(() => undefined);
      }
      upload = null;
    });
  });

  return wss;
}
