import { db } from '@/app/prisma';
import { excludeFields } from '@/utils/helper';
import { Request, Response } from 'express';

export const profileController = async (req: Request, res: Response) => {
  try {
    // FINDING USER WITH USER ID PARAMS
    const user = await db.user.findFirst({
      where: { id: req.params.id },
    });

    // USER NOT FOUND WITH GIVEN USER ID
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND', data: null });

    const _user = { ...excludeFields(user, ['password']), myself: user.id === req.userId };

    return res.status(200).json({ message: 'User Found', data: _user });
  } catch (e) {
    return res.status(400).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
