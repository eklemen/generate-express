import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController'

/* GET all users */
router.get('/', userController.getAllUsers);

export default router;
