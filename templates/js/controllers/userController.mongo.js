import { User } from '../models';

export const getAllUsers = async (req, res, next) => {
  try {
    const data = User.find();
    res.send({ name: 'User Route', data })
  }
  catch (err) { next(err) }
};
