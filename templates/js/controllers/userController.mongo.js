import {User} from '../models';

export const getAllUsers = (req, res, next) => {
  User.find().then(() => {
    res.send('User route');
  })
};