import {User} from '../models';

export const getAllUsers = (req, res, next) => {
  User.findAll({}).then((data) => {
    res.send({name: 'User Route', data});
  })
};
