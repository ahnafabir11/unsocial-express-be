import { Router } from 'express';

import { authRouter } from '@/routes/auth/auth.routes';
import { profileRouter } from './profile/profile.routes';

const router = Router();

router.use(authRouter);
router.use(profileRouter);

export { router };
