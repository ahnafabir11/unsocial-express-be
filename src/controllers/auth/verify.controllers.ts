import { db } from '@/app/prisma';
import { excludeFields, verifyToken } from '@/utils/helper';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

type JwtTokenPayload = JwtPayload & { email: string; fullName: string };

export const verifyController = async (req: Request, res: Response) => {
  try {
    // GETTING TOKEN QUERY PARAM
    const token = req.query.token;

    // TOKEN NOT FOUND
    // SENDING ERROR RESPONSE
    if (!token) return res.status(400).json({ message: 'INVALID_TOKEN', data: null });

    // VALIDATING TOKEN
    const { email } = <JwtTokenPayload>verifyToken(String(token));

    // UPDATING USER AS VERIFIED
    const user = await db.user.update({
      where: { email },
      data: { verified: true },
    });

    const _user = excludeFields(user, ['password']);

    return res.status(200).json({ message: 'PROFILE_VERIFIED', data: _user });
  } catch (e: any) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError' || e.name === 'NotBeforeError') {
      return res.status(400).json({ message: 'INVALID_TOKEN', data: null });
    }

    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
