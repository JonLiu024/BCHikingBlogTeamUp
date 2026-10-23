const JOURNAL_KEY = /^journals\/[a-f0-9]{24}\/[A-Za-z0-9._-]+$/;

export function safeFileName(name: string): string {
  const cleaned = String(name || "media").replace(/[^\w.\-]+/g, "_").slice(0, 80);
  return cleaned || "media";
}

export function isJournalKey(key: string): boolean {
  return JOURNAL_KEY.test(key) && !key.includes("..");
}

export function keyFromLocation(url: string, bucket: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  const path = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (!path || path.includes("..") || path.includes("\\")) return null;

  const virtualHost = host === `${bucket}.s3.amazonaws.com` || host.startsWith(`${bucket}.s3.`);
  if (virtualHost) return path;

  const pathStyle = host === "s3.amazonaws.com" || host.startsWith("s3.");
  if (pathStyle && path.startsWith(`${bucket}/`)) {
    return path.slice(bucket.length + 1);
  }
  return null;
}

export function isMissingObject(error: unknown): boolean {
  const code =
    typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
  return code === "NotFound" || code === "NoSuchKey";
}

export function objectLocation(bucket: string, key: string, given?: string): string {
  if (given) return given;
  const encoded = key.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `https://${bucket}.s3.us-east-1.amazonaws.com/${encoded}`;
}
