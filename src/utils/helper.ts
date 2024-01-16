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
