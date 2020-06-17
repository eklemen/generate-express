import {Request, Response, NextFunction} from 'express';
import {User} from '../models';

export const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
  User.findAll({}).then(() => {
    res.send('User route');
  })
};
