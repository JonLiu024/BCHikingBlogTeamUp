import { currentUser } from "../api";

const httpBase = process.env.REACT_APP_API_URL || "http://localhost:5055";

export function mediaSocketUrl() {
  return `${httpBase.replace(/^http/i, "ws")}/media`;
}

class MediaSession {
  constructor(socket) {
    this.socket = socket;
    this.inbox = [];
    this.binaryInbox = [];
    this.waiters = [];
    this.binaryWaiters = [];
    socket.onmessage = (event) => {
      if (typeof event.data === "string") this.deliver(JSON.parse(event.data));
      else this.deliverBinary(event.data);
    };
  }

  send(message) {
    this.socket.send(JSON.stringify(message));
  }

  deliver(message) {
    const index = this.waiters.findIndex((waiter) => waiter.match(message));
    if (index === -1) {
      this.inbox.push(message);
      return;
    }
    const [waiter] = this.waiters.splice(index, 1);
    waiter.resolve(message);
  }

  deliverBinary(data) {
    const waiter = this.binaryWaiters.shift();
    if (waiter) waiter.resolve(data);
    else this.binaryInbox.push(data);
  }

  next(match, timeout = 30000) {
    const found = this.inbox.findIndex(match);
    if (found >= 0) return Promise.resolve(this.inbox.splice(found, 1)[0]);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((waiter) => waiter.resolve !== resolve);
        reject(new Error("The media socket timed out."));
      }, timeout);
      this.waiters.push({
        match,
        resolve: (message) => {
          clearTimeout(timer);
          resolve(message);
        },
      });
    });
  }

  nextBinary() {
    const queued = this.binaryInbox.shift();
    if (queued) return Promise.resolve(queued);
    return new Promise((resolve) => {
      this.binaryWaiters.push({ resolve });
    });
  }

  discardProgress() {
    this.inbox = this.inbox.filter((item) => item.op !== "progress");
  }
}

let current = null;
let opening = null;
let tail = Promise.resolve();

function enqueue(task) {
  const run = tail.then(task, task);
  tail = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function openSession() {
  if (current && current.socket.readyState === WebSocket.OPEN) return Promise.resolve(current);
  if (opening) return opening;
  const user = currentUser();
  if (!user?.token) return Promise.reject(new Error("Please log in first."));
  opening = new Promise((resolve, reject) => {
    const socket = new WebSocket(mediaSocketUrl());
    socket.binaryType = "arraybuffer";
    const session = new MediaSession(socket);
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      opening = null;
      if (error) reject(error);
      else resolve(value);
    };
    socket.onopen = () => session.send({ op: "hello", token: user.token });
    socket.onerror = () => finish(new Error("Could not open the media socket."));
    socket.onclose = () => {
      if (current === session) current = null;
      finish(new Error("The media socket closed."));
    };
    session
      .next((message) => message.op === "ready" || message.op === "error")
      .then((message) => {
        if (message.op === "error") finish(new Error(message.message));
        else {
          current = session;
          finish(null, session);
        }
      })
      .catch((error) => finish(error));
  });
  return opening;
}

async function control(session) {
  const message = await session.next((item) => item.op === "error" || item.op !== "progress");
  if (message.op === "error") throw new Error(message.message);
  return message;
}

export function uploadJournalFile(file, onProgress) {
  return enqueue(async () => {
    const session = await openSession();
    session.discardProgress();
    session.send({ op: "upload-start", name: file.name, mime: file.type, size: file.size });
    const ready = await control(session);
    if (ready.op !== "upload-ready") throw new Error("The server did not accept the upload.");
    let offset = 0;
    while (offset < file.size) {
      const buffer = await file.slice(offset, offset + ready.chunkSize).arrayBuffer();
      const target = offset + buffer.byteLength;
      session.socket.send(buffer);
      let seen = false;
      while (!seen) {
        const message = await session.next((item) => item.op === "progress" || item.op === "error");
        if (message.op === "error") throw new Error(message.message);
        onProgress(message);
        seen = message.phase === "received" && message.loaded === target;
      }
      offset = target;
    }
    session.send({ op: "upload-finish" });
    const done = await control(session);
    if (done.op !== "upload-done") throw new Error("The upload did not finish.");
    onProgress({ phase: "stored", loaded: file.size, stored: file.size, total: file.size });
    return done;
  });
}

export function downloadJournalFile(url, onProgress) {
  return enqueue(async () => {
    const session = await openSession();
    session.discardProgress();
    session.send({ op: "download-start", url });
    const parts = [];
    let done = null;
    while (!done) {
      const message = await session.next(
        (item) => item.op === "progress" || item.op === "download-done" || item.op === "error"
      );
      if (message.op === "error") throw new Error(message.message);
      if (message.op === "download-done") {
        done = message;
        break;
      }
      onProgress(message);
      parts.push(new Uint8Array(await session.nextBinary()));
    }
    return { blob: new Blob(parts, { type: done.mime }), mime: done.mime };
  });
}
