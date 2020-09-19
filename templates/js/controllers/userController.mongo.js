import { User } from '../models';

export const getAllUsers = (req, res) => {
  User.find().then((data) => {
    res.send({ name: 'User Route', data });
  });
};
