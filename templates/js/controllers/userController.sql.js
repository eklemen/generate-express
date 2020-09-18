import db from '../models';

export const getAllUsers = (_, res) => {
  db.User.findAll({}).then((data) => {
    res.send({ name: 'User Route', data });
  });
};
