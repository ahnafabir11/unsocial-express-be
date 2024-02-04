import { config } from '@/app/config';
import { s3Client } from '@/services/s3';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Express } from 'express';
import fs from 'fs';

type FolderName = 'PROFILE_PICTURES' | 'COVER_PICTURES';

export const uploadFileToS3 = async (objectKey: string, folderName: FolderName, file: Express.Multer.File) => {
  try {
    const body = fs.readFileSync(file.path);

    const command = new PutObjectCommand({
      Bucket: config.s3BucketName,
      Key: `${folderName}/${objectKey}`,
      Body: body,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);
    return `https://${config.s3BucketName}.s3.${config.s3BucketRegion}.amazonaws.com/${folderName}/${objectKey}`;
  } catch (e) {
    throw new Error('Could not upload file to S3');
  } finally {
    fs.unlinkSync(file.path);
  }
};

export const removeFileFromS3 = async (objectKey: string, folderName: FolderName) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.s3BucketName,
      Key: `${folderName}/${objectKey}`,
    });
    await s3Client.send(command);
  } catch (e) {
    throw new Error('Could not remove file from S3');
  }
};
