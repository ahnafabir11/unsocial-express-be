import { router } from '@/routes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config';

// initialize express app
const app = express();

// initialize necessary middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [config.clientOrigin],
  }),
);

// testing endpoint
app.get('/', async (req, res) => {
  try {
    return res.status(200).json({ message: 'server up and running', data: { time: new Date() } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: error });
  }
});

// routes
app.use('/api/v1', router);

export { app };
