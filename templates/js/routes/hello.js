import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.send({ data: 'Hello from Generate-Express' });
});

export default router;
