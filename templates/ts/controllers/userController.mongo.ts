import { Request, Response } from 'express';
import { User } from '../models';

export const getAllUsers = (req: Request, res: Response) => {
  User.find().then((data) => {
    res.send({ name: 'User Route', data });
  });
};
