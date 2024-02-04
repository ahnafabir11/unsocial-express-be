import { db } from '@/app/prisma';
import { excludeFields } from '@/utils/helper';
import { removeFileFromS3, uploadFileToS3 } from '@/utils/s3';
import { updateProfileBodySchema } from '@/validators/profile.validator';
import { Request, Response } from 'express';

export const profileController = async (req: Request, res: Response) => {
  try {
    // FINDING USER WITH USER ID PARAMS
    const user = await db.user.findFirst({
      where: { id: req.params.id },
    });

    // USER NOT FOUND WITH GIVEN USER ID
    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND', data: null });

    // CHECKING IF THIS PROFILE BELONGS TO USER
    const myself = user.id === req.userId;

    // CHECKING IF USER FOLLOWING THIS PROFILE
    const follow = await db.follow.findFirst({
      where: { followerId: req.params.id, followingId: req.userId },
    });

    const followed = !!follow;

    const _user = { ...excludeFields(user, ['password']), myself, followed };

    return res.status(200).json({ message: 'Profile fetched!', data: _user });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const updateProfileController = async (req: Request, res: Response) => {
  try {
    // FINDING USER WITH USER ID PARAMS
    const user = await db.user.findFirst({
      where: { id: req.userId },
    });

    // VALIDATING REQUEST BODY
    const validation = updateProfileBodySchema.safeParse(req.body);

    // SENDING ERROR RESPONSE FOR VALIDATION ERROR
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: errors });
    }

    const { fullName, about, removeProfilePicture, removeCoverPicture } = validation.data;

    let profilePicture: null | undefined | string = removeProfilePicture ? null : undefined;
    let coverPicture: null | undefined | string = removeCoverPicture ? null : undefined;

    // USER HAS A PROFILE PICTURE AND ASKED TO REMOVE IT
    // REMOVE FROM S3 BUCKET
    if (removeProfilePicture && user?.profilePicture) {
      await removeFileFromS3(req.userId, 'PROFILE_PICTURES');
    }

    // USER HAS A COVER PICTURE AND ASKED TO REMOVE IT
    // REMOVE FROM S3 BUCKET
    if (removeCoverPicture && user?.coverPicture) {
      await removeFileFromS3(req.userId, 'COVER_PICTURES');
    }

    // UPLOADING PROFILE PICTURE TO S3 BUCKET
    // USER DID'T MENTIONED ABOUT REMOVING PROFILE PICTURE
    // USER SEND A PROFILE PICTURE
    if ((req.files as any)?.['profilePicture']?.[0] && !removeProfilePicture) {
      const objectUrl = await uploadFileToS3(req.userId, 'PROFILE_PICTURES', (req.files as any)['profilePicture'][0]);
      profilePicture = objectUrl;
    }

    // UPLOADING COVER PICTURE TO S3 BUCKET
    // USER DID'T MENTIONED ABOUT REMOVING COVER PICTURE
    // USER SEND A COVER PICTURE
    if ((req.files as any)?.['coverPicture']?.[0] && !removeCoverPicture) {
      const objectUrl = await uploadFileToS3(req.userId, 'COVER_PICTURES', (req.files as any)['coverPicture'][0]);
      coverPicture = objectUrl;
    }

    // FINDING USER WITH USER ID PARAMS
    const updatedUser = await db.user.update({
      where: { id: req.userId },
      data: { fullName, about, profilePicture, coverPicture },
    });

    const _user = excludeFields(updatedUser, ['password']);

    return res.status(200).json({ message: 'Profile updated!', data: _user });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
