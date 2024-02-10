import { Router } from 'express';

import { loginController, logoutController, meController, signupController } from '@/controllers/auth/auth.controllers';
import { authentication } from '@/middlewares/authentication.middleware';
import {
  changePasswordController,
  changePasswordRequestController,
  resetPasswordController,
  resetPasswordRequestController,
} from '@/controllers/auth/password.controllers';

const authRouter = Router();

authRouter.post('/auth/signup', signupController);
authRouter.post('/auth/login', loginController);
authRouter.get('/auth/me', authentication, meController);
authRouter.get('/auth/logout', authentication, logoutController);

authRouter.get('/auth/change-password', authentication, changePasswordRequestController);
authRouter.put('/auth/change-password', authentication, changePasswordController);

authRouter.post('/auth/reset-password', resetPasswordRequestController);
authRouter.put('/auth/reset-password', resetPasswordController);

export { authRouter };
