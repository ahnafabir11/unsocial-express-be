import { Router } from 'express';

import { meController } from '@/controllers/auth/auth.controllers';

const authRouter = Router();

authRouter.get('/auth/me', meController);

export { authRouter };
