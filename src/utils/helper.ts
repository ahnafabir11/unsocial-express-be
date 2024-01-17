import { config } from '@/app/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, config.saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (data: string | object | Buffer, options?: jwt.SignOptions) => {
  return jwt.sign(data, config.jwtSecret, { expiresIn: '1d', ...options });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};

type ExcludeFields<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};

export const excludeFields = <T, K extends keyof T>(obj: T, fieldsToExclude: K[]): ExcludeFields<T, K> => {
  const result = { ...obj };
  fieldsToExclude.forEach((field) => {
    delete result[field];
  });
  return result;
};
