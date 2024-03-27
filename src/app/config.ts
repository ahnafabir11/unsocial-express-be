import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  dbURL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unsocial',
  saltRounds: Number(process.env.SALT_ROUNDS) || 12,
  jwtSecret: process.env.JWT_SECRET || 'YOUR_SECRET_KEY',
  resendApiKey: process.env.RESEND_API_KEY || 're_',
  resendEmailAddress: process.env.RESEND_EMAIL_ADDRESS || 'Acme <onboarding@resend.dev>',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:300',
  s3AccessKey: process.env.S3_ACCESS_KEY || '',
  s3SecretKey: process.env.S3_SECRET_KEY || '',
  s3BucketName: process.env.S3_BUCKET_NAME || '',
  s3BucketRegion: process.env.S3_BUCKET_REGION || '',
} as const;
