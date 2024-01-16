import { Router } from 'express';

import { loginController, meController, signupController } from '@/controllers/auth/auth.controllers';

const authRouter = Router();

authRouter.post('/auth/signup', signupController);
authRouter.post('/auth/login', loginController);
authRouter.get('/auth/me', meController);

export { authRouter };
