import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  dbURL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unsocial',
  saltRounds: Number(process.env.SALT_ROUNDS) || 12,
  jwtSecret: process.env.JWT_SECRET || 'YOUR_SECRET_KEY',
  resendApiKey: process.env.RESEND_API_KEY || 're_',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:300',
} as const;
