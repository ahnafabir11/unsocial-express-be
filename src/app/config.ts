import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  dbURL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unsocial',
} as const;
