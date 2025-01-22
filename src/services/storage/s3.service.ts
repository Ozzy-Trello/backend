import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";

const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const endpoint = process.env.S3_ENDPOINT;

if (!accessKeyId || !secretAccessKey || !region || !endpoint) {
  throw new Error("Missing required environment variables");
}

export const s3 = new S3Client({
  region: region,
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  forcePathStyle: true,
});
