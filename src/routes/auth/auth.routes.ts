import { Router } from 'express';

import { loginController, logoutController, meController, signupController } from '@/controllers/auth/auth.controllers';
import { authentication } from '@/middlewares/authentication.middleware';

const authRouter = Router();

authRouter.post('/auth/signup', signupController);
authRouter.post('/auth/login', loginController);
authRouter.get('/auth/me', authentication, meController);
authRouter.get('/auth/logout', authentication, logoutController);

export { authRouter };
