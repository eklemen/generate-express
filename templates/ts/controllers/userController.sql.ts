import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = (req: Request, res: Response) => {
  User.findAll({}).then((data) => {
    res.send({ name: 'User Route', data });
  });
};
