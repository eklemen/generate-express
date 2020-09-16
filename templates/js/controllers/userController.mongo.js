import { User } from '../models';

export const getAllUsers = (_, res) => {
  User.find().then((data) => {
    res.send({ name: 'User Route', data });
  });
};
