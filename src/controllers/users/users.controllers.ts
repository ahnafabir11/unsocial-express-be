import { db } from '@/app/prisma';
import { usersQuerySchema } from '@/validators/queries';
import { Request, Response } from 'express';

export const usersController = async (req: Request, res: Response) => {
  try {
    const validation = usersQuerySchema.safeParse({ page: req.query.page, limit: req.query.limit, search: req.query.search });

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'INVALID_QUERIES', data: errors });
    }

    const { page, limit, search } = validation.data;

    const usersCount = await db.user.count({
      where: {
        verified: true,
        id: { not: req.userId },
        fullName: { contains: search, mode: 'insensitive' },
      },
    });

    const users = await db.user.findMany({
      take: limit,
      skip: limit * (page - 1),
      where: {
        verified: true,
        id: { not: req.userId },
        fullName: { contains: search, mode: 'insensitive' },
      },
      select: {
        id: true,
        fullName: true,
        coverPicture: true,
        followerCount: true,
        profilePicture: true,
        followingCount: true,
        // CHECKING IF PROFILE IS FOLLOWING THE LOGGED IN USER
        followers: { where: { followingId: req.userId } },
      },
    });

    // CHECKING IF PROFILES ARE BEING FOLLOWED BY THE USER
    const _users = users.map(({ followers, ...user }) => {
      const followed = followers.length > 0;
      return { ...user, followed };
    });

    return res.status(200).json({ message: 'USERS_FETCHED', data: { usersCount, users: _users } });
  } catch (e: any) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
