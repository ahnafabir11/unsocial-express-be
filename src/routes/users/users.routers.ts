import { usersController } from '@/controllers/users/users.controllers';
import { authentication } from '@/middlewares/authentication.middleware';
import { Router } from 'express';

const usersRouter = Router();

usersRouter.get('/users', authentication, usersController);

export { usersRouter };
