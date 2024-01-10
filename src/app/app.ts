import express from 'express';

// define cors options

// initialize express app
const app = express();

// initialize necessary middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// testing endpoint
app.get('/', async (req, res) => {
  try {
    return res.status(200).json({ message: 'server up and running', data: { time: new Date() } });
  } catch (error) {
    console.log(error);
  }
});

// routes

export { app };
