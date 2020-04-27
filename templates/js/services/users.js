import {User} from '../models';

export const getUser = (req, res, next) => {
  User.find({}).then(() => {
    res.send('User route');
  })
};