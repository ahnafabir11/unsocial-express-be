import { Router } from 'express';

import { authentication } from '@/middlewares/authentication.middleware';
import { profileController } from '@/controllers/profile/profile.controllers';

const profileRouter = Router();

profileRouter.get('/profile/:id', authentication, profileController);

export { profileRouter };
