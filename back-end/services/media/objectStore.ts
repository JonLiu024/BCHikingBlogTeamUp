export type StoredPart = { partNumber: number; etag: string };

export interface ObjectBody {
  size: number;
  mime: string;
  read: (start: number, end: number) => Promise<Buffer>;
}

export interface ObjectStore {
  putObject(input: { key: string; body: Buffer; mime: string }): Promise<{ location: string }>;
  startMultipart(input: { key: string; mime: string }): Promise<{ uploadId: string }>;
  uploadPart(input: {
    key: string;
    uploadId: string;
    partNumber: number;
    body: Buffer;
  }): Promise<{ etag: string }>;
  completeMultipart(input: {
    key: string;
    uploadId: string;
    parts: StoredPart[];
  }): Promise<{ location: string }>;
  abortMultipart(input: { key: string; uploadId: string }): Promise<void>;
  openObject(key: string): Promise<ObjectBody>;
}
