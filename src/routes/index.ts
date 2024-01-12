import { Router } from 'express';

import { authRouter } from '@/routes/auth/auth.routes';

const router = Router();

router.use(authRouter);

export { router };
