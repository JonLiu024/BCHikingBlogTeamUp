import s3 from "../../config/awsConfig";
import { objectLocation } from "./keys";
import { ObjectStore } from "./objectStore";

function toBuffer(body: unknown): Buffer {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body);
  if (body instanceof Uint8Array) return Buffer.from(body);
  throw new Error("S3 returned an unreadable object body");
}

export function s3ObjectStore(): ObjectStore {
  const bucket = process.env.AWS_S3_BUCKET_NAME || "";
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET_NAME is missing");
  }

  return {
    async putObject({ key, body, mime }) {
      await s3.putObject({ Bucket: bucket, Key: key, Body: body, ContentType: mime }).promise();
      return { location: objectLocation(bucket, key) };
    },
    async startMultipart({ key, mime }) {
      const data = await s3
        .createMultipartUpload({ Bucket: bucket, Key: key, ContentType: mime })
        .promise();
      if (!data.UploadId) throw new Error("S3 did not start a multipart upload");
      return { uploadId: data.UploadId };
    },
    async uploadPart({ key, uploadId, partNumber, body }) {
      const data = await s3
        .uploadPart({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: body,
        })
        .promise();
      if (!data.ETag) throw new Error("S3 did not return a part tag");
      return { etag: data.ETag };
    },
    async completeMultipart({ key, uploadId, parts }) {
      const data = await s3
        .completeMultipartUpload({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: parts.map((part) => ({ ETag: part.etag, PartNumber: part.partNumber })),
          },
        })
        .promise();
      return { location: objectLocation(bucket, key, data.Location) };
    },
    async abortMultipart({ key, uploadId }) {
      await s3.abortMultipartUpload({ Bucket: bucket, Key: key, UploadId: uploadId }).promise();
    },
    async openObject(key) {
      const head = await s3.headObject({ Bucket: bucket, Key: key }).promise();
      const size = head.ContentLength ?? 0;
      const mime = head.ContentType || "application/octet-stream";
      return {
        size,
        mime,
        read: async (start, end) => {
          const data = await s3
            .getObject({ Bucket: bucket, Key: key, Range: `bytes=${start}-${end}` })
            .promise();
          return toBuffer(data.Body);
        },
      };
    },
  };
}
