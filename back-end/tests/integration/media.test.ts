import assert from "node:assert/strict";
import http from "http";
import { describe, it } from "node:test";
import { WebSocket } from "ws";
import { memoryObjectStore } from "../../services/media/memoryStore";
import { attachMediaServer } from "../../services/media/mediaServer";

const userId = "6ab71c7ec9c03b0124c30255";

function listen(): Promise<{ server: http.Server; port: number; store: ReturnType<typeof memoryObjectStore> }> {
  const store = memoryObjectStore();
  const server = http.createServer();
  attachMediaServer(server, {
    store,
    bucket: "test-bucket",
    chunkSize: 4,
    partSize: 6,
    maxBytes: 100,
    authenticate: async (token) => (token === "good" ? { id: userId } : null),
  });
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("No port");
      resolve({ server, port: address.port, store });
    });
  });
}

function connect(port: number): Promise<{
  socket: WebSocket;
  next: () => Promise<{ data: Buffer; binary: boolean }>;
}> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://127.0.0.1:${port}/media`);
    const inbox: { data: Buffer; binary: boolean }[] = [];
    const waiters: Array<(message: { data: Buffer; binary: boolean }) => void> = [];
    socket.on("message", (data, isBinary) => {
      const buffer = Array.isArray(data) ? Buffer.concat(data) : Buffer.from(data as Buffer);
      const message = { data: buffer, binary: Boolean(isBinary) };
      const waiter = waiters.shift();
      if (waiter) waiter(message);
      else inbox.push(message);
    });
    const next = () => {
      const queued = inbox.shift();
      if (queued) return Promise.resolve(queued);
      return new Promise<{ data: Buffer; binary: boolean }>((ready) => waiters.push(ready));
    };
    socket.once("open", () => resolve({ socket, next }));
    socket.once("error", reject);
  });
}

async function json(next: () => Promise<{ data: Buffer; binary: boolean }>) {
  const message = await next();
  assert.equal(message.binary, false);
  return JSON.parse(message.data.toString("utf8")) as Record<string, unknown>;
}

describe("journal media socket", () => {
  it("stores chunked bytes in order and sends them back with progress", { timeout: 5000 }, async () => {
    const { server, port, store } = await listen();
    const { socket, next } = await connect(port);
    socket.send(JSON.stringify({ op: "hello", token: "good" }));
    const ready = await json(next);
    assert.equal(ready.op, "ready");
    assert.equal(ready.chunkSize, 4);

    const payload = Buffer.from("abcdefghij");
    socket.send(
      JSON.stringify({ op: "upload-start", name: "ridge.jpg", mime: "image/jpeg", size: payload.length })
    );
    const accepted = await json(next);
    assert.equal(accepted.op, "upload-ready");

    const received: number[] = [];
    for (let offset = 0; offset < payload.length; offset += 4) {
      socket.send(payload.subarray(offset, offset + 4));
      let seen = false;
      while (!seen) {
        const message = await json(next);
        assert.equal(message.op, "progress");
        if (message.phase === "received") {
          received.push(Number(message.loaded));
          seen = message.loaded === Math.min(offset + 4, payload.length);
        }
      }
    }
    assert.deepEqual(received, [4, 8, 10]);

    socket.send(JSON.stringify({ op: "upload-finish" }));
    let done: Record<string, unknown> | null = null;
    while (!done) {
      const message = await json(next);
      if (message.op === "upload-done") done = message;
      else assert.equal(message.op, "progress");
    }
    const key = String(done.key);
    assert.equal(store.saved.get(key)?.body.toString("utf8"), "abcdefghij");
    assert.match(String(done.url), /abcdefghij|journals/);

    socket.send(JSON.stringify({ op: "download-start", url: done.url }));
    const pieces: Buffer[] = [];
    let downloaded = false;
    while (!downloaded) {
      const message = await json(next);
      if (message.op === "download-done") {
        downloaded = true;
        break;
      }
      assert.equal(message.phase, "sending");
      const binary = await next();
      assert.equal(binary.binary, true);
      pieces.push(binary.data);
    }
    assert.equal(Buffer.concat(pieces).toString("utf8"), "abcdefghij");
    socket.close();
    await new Promise((resolve) => server.close(resolve));
  });

  it("rejects a file that is not a photo or video", { timeout: 5000 }, async () => {
    const { server, port } = await listen();
    const { socket, next } = await connect(port);
    socket.send(JSON.stringify({ op: "hello", token: "good" }));
    await json(next);
    socket.send(JSON.stringify({ op: "upload-start", name: "notes.txt", mime: "text/plain", size: 4 }));
    const rejected = await json(next);
    assert.equal(rejected.op, "error");
    socket.close();
    await new Promise((resolve) => server.close(resolve));
  });
});
