import { db } from '@/app/prisma';
import { excludeFields } from '@/utils/helper';
import { usersQuerySchema } from '@/validators/queries';
import { Request, Response } from 'express';

export const followProfileController = async (req: Request, res: Response) => {
  try {
    // CHECKING IF FOLLOWING MYSELF
    if (req.userId === req.params.id) return res.status(400).json({ message: 'FOLLOWING_MYSELF', data: null });

    // FINDING PROFILE WITH ID PARAMS
    const hasUser = await db.user.findFirst({
      where: { id: req.params.id },
    });

    // PROFILE NOT FOUND WITH GIVEN ID PARAMS
    if (!hasUser) return res.status(404).json({ message: 'USER_NOT_FOUND', data: null });

    // CHECKING IF USER ALREADY FOLLOWING
    const isFollowing = await db.follow.findFirst({ where: { followerId: req.params.id, followingId: req.userId } });

    // SENDING ERROR RESPONSE FOR ALREADY FOLLOWED
    if (isFollowing) return res.status(400).json({ message: 'ALREADY_FOLLOWING', data: null });

    await db.follow.create({ data: { followerId: req.params.id, followingId: req.userId } });

    // UPDATING FOLLOWER COUNT (PROFILE)
    const profile = await db.user.update({
      where: { id: req.params.id },
      data: { followerCount: { increment: 1 } },
    });

    // UPDATING FOLLOWING COUNT (USER)
    await db.user.update({
      where: { id: req.userId },
      data: { followingCount: { increment: 1 } },
    });

    const _profile = excludeFields(profile, ['password']);

    return res.status(200).json({ message: 'PROFILE_FOLLOWED', data: _profile });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const unfollowProfileController = async (req: Request, res: Response) => {
  try {
    // CHECKING IF FOLLOWING MYSELF
    if (req.userId === req.params.id) return res.status(400).json({ message: 'UNFOLLOWING_MYSELF', data: null });

    // FINDING PROFILE WITH ID PARAMS
    const hasUser = await db.user.findFirst({
      where: { id: req.params.id },
    });

    // PROFILE NOT FOUND WITH GIVEN ID PARAMS
    if (!hasUser) return res.status(404).json({ message: 'USER_NOT_FOUND', data: null });

    // CHECKING IF USER FOLLOWING
    const isFollowing = await db.follow.findFirst({ where: { followerId: req.params.id, followingId: req.userId } });

    // SENDING ERROR RESPONSE FOR NOT FOLLOWING PROFILE
    if (!isFollowing) return res.status(400).json({ message: 'NOT_FOLLOWING', data: null });

    await db.follow.delete({ where: { followerId_followingId: { followerId: req.params.id, followingId: req.userId } } });

    // UPDATING FOLLOWER COUNT (PROFILE)
    const profile = await db.user.update({
      where: { id: req.params.id },
      data: { followerCount: { decrement: 1 } },
    });

    // UPDATING FOLLOWING COUNT (USER)
    await db.user.update({
      where: { id: req.userId },
      data: { followingCount: { decrement: 1 } },
    });

    const _profile = excludeFields(profile, ['password']);

    return res.status(200).json({ message: 'PROFILE_UNFOLLOWED', data: _profile });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const followersController = async (req: Request, res: Response) => {
  try {
    // FINDING PROFILE WITH ID PARAMS
    const hasUser = await db.user.findFirst({
      where: { id: req.params.id },
    });

    // PROFILE NOT FOUND WITH GIVEN ID PARAMS
    if (!hasUser) return res.status(404).json({ message: 'USER_NOT_FOUND', data: null });

    const validation = usersQuerySchema.safeParse({ page: req.query.page, limit: req.query.limit, search: req.query.search });

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'INVALID_QUERIES', data: errors });
    }

    const { page, limit, search } = validation.data;

    // GETTING TOTAL FOLLOWERS COUNT OF THE PROFILE
    const totalFollowers = await db.follow.count({
      where: { followerId: req.params.id, following: { fullName: { contains: search, mode: 'insensitive' } } },
    });

    // GETTING THE FOLLOWERS LIST OF THE PROFILE
    // INCLUDING THEIR FOLLOWERS TO KNOW IF USER
    // IS FOLLOWING THE EACH FOLLOWER PROFILE OR NOT
    const followers = await db.follow.findMany({
      where: { followerId: req.params.id, following: { fullName: { contains: search, mode: 'insensitive' } } },
      include: { following: { include: { followers: { where: { followingId: req.userId } } } } },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: limit * (page - 1),
    });

    // CHECKING IF THE FOLLOWER PROFILE IS ME AND
    // CHECKING IF THE FOLLOWER PROFILE IS ALREADY FOLLOWED BY USER
    // AND REMOVING THE PASSWORD AND FOLLOWERS FIELD FROM EACH FOLLOWER PROFILE
    const _followers = followers.map(({ following, ...follower }) => ({
      ...follower,
      myself: follower.followingId === req.userId,
      followed: Boolean(following.followers.length),
      user: excludeFields(following, ['password', 'followers']),
    }));

    return res.status(200).json({ message: 'FOLLOWERS_FETCHED', data: { followers: _followers, totalFollowers } });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const followingsController = async (req: Request, res: Response) => {
  try {
    // FINDING PROFILE WITH ID PARAMS
    const hasUser = await db.user.findFirst({
      where: { id: req.params.id },
    });

    // PROFILE NOT FOUND WITH GIVEN ID PARAMS
    if (!hasUser) return res.status(404).json({ message: 'USER_NOT_FOUND', data: null });

    const validation = usersQuerySchema.safeParse({ page: req.query.page, limit: req.query.limit, search: req.query.search });

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'INVALID_QUERIES', data: errors });
    }

    const { page, limit, search } = validation.data;

    // GETTING TOTAL FOLLOWINGS COUNT OF THE PROFILE
    const totalFollowings = await db.follow.count({
      where: { followingId: req.params.id, follower: { fullName: { contains: search, mode: 'insensitive' } } },
    });

    // GETTING THE FOLLOWINGS LIST OF THE PROFILE
    // INCLUDING THEIR FOLLOWERS TO KNOW IF USER
    // IS FOLLOWING THE EACH FOLLOWING PROFILE OR NOT
    const followings = await db.follow.findMany({
      where: { followingId: req.params.id, follower: { fullName: { contains: search, mode: 'insensitive' } } },
      include: { follower: { include: { followers: { where: { followingId: req.userId } } } } },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: limit * (page - 1),
    });

    // CHECKING IF THE FOLLOWING PROFILE IS ME AND
    // CHECKING IF THE FOLLOWING PROFILE IS ALREADY FOLLOWED BY USER
    // AND REMOVING THE PASSWORD AND FOLLOWERS FIELD FROM EACH FOLLOWING PROFILE
    const _followings = followings.map(({ follower, ...following }) => ({
      ...following,
      myself: following.followerId === req.userId,
      followed: Boolean(follower.followers.length),
      user: excludeFields(follower, ['password', 'followers']),
    }));

    return res.status(200).json({ message: 'FOLLOWINGS_FETCHED', data: { followings: _followings, totalFollowings } });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
