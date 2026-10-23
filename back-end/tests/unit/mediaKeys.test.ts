import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isJournalKey, keyFromLocation } from "../../services/media/keys";

describe("journal object keys", () => {
  const bucket = "bc-hiker-chat-app";
  const key = "journals/6ab71c7ec9c03b0124c30255/photo.jpg";

  it("reads a virtual-hosted S3 url", () => {
    const url = `https://${bucket}.s3.us-east-1.amazonaws.com/${key}`;
    assert.equal(keyFromLocation(url, bucket), key);
    assert.equal(isJournalKey(key), true);
  });

  it("rejects a key outside the journal prefix", () => {
    const url = `https://${bucket}.s3.amazonaws.com/secrets/env`;
    assert.equal(isJournalKey(keyFromLocation(url, bucket) || ""), false);
  });
});
