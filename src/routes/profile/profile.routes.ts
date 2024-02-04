import { Router } from 'express';

import { authentication } from '@/middlewares/authentication.middleware';
import { profileController, updateProfileController } from '@/controllers/profile/profile.controllers';
import {
  followProfileController,
  followersController,
  followingsController,
  unfollowProfileController,
} from '@/controllers/profile/follow.controllers';
import { multerMiddleware } from '@/middlewares/multer.middleware';

const profileRouter = Router();

profileRouter.put(
  '/profile',
  authentication,
  multerMiddleware([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPicture', maxCount: 1 },
  ]),
  updateProfileController,
);

profileRouter.get('/profile/:id', authentication, profileController);
profileRouter.get('/profile/:id/followers', authentication, followersController);
profileRouter.get('/profile/:id/followings', authentication, followingsController);

profileRouter.put('/profile/:id/follow', authentication, followProfileController);
profileRouter.put('/profile/:id/unfollow', authentication, unfollowProfileController);

export { profileRouter };
