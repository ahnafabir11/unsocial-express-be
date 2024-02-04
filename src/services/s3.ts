import { config } from '@/app/config';
import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: config.s3BucketRegion,
  credentials: { accessKeyId: config.s3AccessKey, secretAccessKey: config.s3SecretKey },
});
