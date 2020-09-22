import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
  User.findAll({}).then((data) => {
    res.send({ name: 'User Route', data });
  }).catch((err) => next(err ));
};
