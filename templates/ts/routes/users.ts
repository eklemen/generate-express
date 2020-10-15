import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

/* GET all users */
router.get('/', userController.getAllUsers);

export default router;
