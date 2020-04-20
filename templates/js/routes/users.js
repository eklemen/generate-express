import express from 'express';
const router = express.Router();
import UserService from '../services/users';

/* GET home page. */
router.get('/', UserService.getUser);

export default router;
