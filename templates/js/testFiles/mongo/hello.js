const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../../server/app');

const request = supertest(app);

describe('/api routes (hello):', () => {
  beforeAll(async () => {
    await mongoose.disconnect();
    const url = 'mongodb://127.0.0.1/test';
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
  test('GET: /api', async (done) => {
    await request
      .get('/api/')
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({ data: 'Hello from Generate-Express' });
        done();
      });
  });
});
