import express, { Request, Response } from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (_: Request, res: Response) => {
    res.send('Hello from Generate-Express');
});

export default router;
