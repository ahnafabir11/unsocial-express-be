import { Request, Response } from 'express';

export const meController = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ message: 'You are logged in', data: {} });
  } catch (error) {
    console.log(error);
  }
};
