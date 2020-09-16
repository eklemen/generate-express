import { User } from '../models';

export const getAllUsers = (_, res) => {
  User.findAll({}).then((data) => {
    res.send({ name: 'User Route', data });
  })
};
