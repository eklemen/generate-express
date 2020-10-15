import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

export const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find().then((data) => {
    res.send({ name: 'User Route', data });
  }).catch((err) => next(err ));
};
