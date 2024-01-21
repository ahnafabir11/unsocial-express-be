import { verifyToken } from '@/utils/helper';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

type JwtTokenPayload = JwtPayload & { id: string; email: string };

export const authentication = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token as string | undefined;

    // TOKEN NOT FOUND
    // SENDING UNAUTHORIZED ERROR RESPONSE
    if (!token) {
      return res.status(401).json({ message: 'UNAUTHORIZED', data: null });
    }

    const { id } = <JwtTokenPayload>verifyToken(token);
    req.userId = id;

    next();
  } catch (e) {
    return res.status(401).json({ message: 'UNAUTHORIZED', data: e });
  }
};
