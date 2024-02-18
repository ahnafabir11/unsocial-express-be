import { db } from '@/app/prisma';
import { Request, Response } from 'express';

export const usersController = async (req: Request, res: Response) => {
  try {
    // GETTING QUERY PARAMS
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const search = req.query.search;

    if (typeof search === 'object') {
      return res.status(400).json({ message: 'INVALID_QUERIES', data: null });
    }

    const usersCount = await db.user.count({
      where: {
        verified: true,
        id: { not: req.userId },
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

    return res.status(200).json({ message: 'Users list', data: { usersCount, users: _users } });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
