import {User} from '../models';

export const getAllUsers = (req, res, next) => {
  User.findAll({}).then(() => {
    res.send('User route');
  })
};