import { Request, Response, NextFunction } from 'express';

export const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
  res.send('User route');
};
