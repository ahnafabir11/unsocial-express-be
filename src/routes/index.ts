import { Router } from 'express';

import { authRouter } from '@/routes/auth/auth.routes';
import { profileRouter } from './profile/profile.routes';
import { usersRouter } from './users/users.routers';

const router = Router();

router.use(authRouter);
router.use(profileRouter);
router.use(usersRouter);

export { router };
