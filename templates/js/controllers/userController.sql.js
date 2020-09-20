import db from '../models';

export const getAllUsers = async (req, res, next) => {
  try {
    const data = db.User.findAll({});
    res.send({ name: 'User Route', data });
  }
  catch (err) { next(err) }
};
