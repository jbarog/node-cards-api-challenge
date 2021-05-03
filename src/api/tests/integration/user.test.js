/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const { some, omitBy, isNil } = require('lodash');
const app = require('../../../index');
const { testUsers } = require('../values');
const User = require('../../models/user.model');

/**
 * root level hooks
 */

async function format(user) {
  const userDb = (await User.findOne({ name: user.name })).parseFields();
  return omitBy(userDb, isNil);
}

describe('Users API', async () => {
  let userAccessToken;
  const wrongAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdHJlYW1sb290cy5jb20iLCJ1c2VySWQiOiI2YTUwMTU5MzA4ZjVhODAwMTExZGU3NTAiLCJpYXQiOjE1MTYyMzkwMjJ9.MFky95ayhiM2xlOMqPc569EqOoJfnL72FtuqmW3H4L0';
  let dbUsers;

  beforeEach(async () => {
    dbUsers = testUsers;
    await User.deleteMany({});
    await User.insertMany([dbUsers.creator, dbUsers.consumer]);
    userAccessToken = dbUsers.creator.token;
    console.log('beforeEach');
  });
  afterEach(async () => {
    await User.deleteMany({});
  });
  describe('GET /v1/users', () => {
    it('wrong user should not access', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${wrongAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
    it('should get all users', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const creator = await format(dbUsers.creator);
          const consumer = await format(dbUsers.consumer);

          const rows = res.body.map((row) => {
            const newRow = { ...row };
            newRow.createdAt = new Date(newRow.createdAt);
            return newRow;
          });

          const includesCreator = some(rows, creator);
          const includesConsumer = some(rows, consumer);

          expect(rows).to.be.an('array');
          expect(rows).to.have.lengthOf(2);
          expect(includesCreator).to.be.true;
          expect(includesConsumer).to.be.true;
        });
    });

    it('users pagination should work', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ page: 2, perPage: 1 })
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.an('object');
          expect(res.body).to.have.lengthOf(1);
        });
    });

    it('should report error when pagination\'s parameters are not a number', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .query({ page: '?', perPage: 'whaat' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { field } = res.body.errors[0];
          const { location } = res.body.errors[0];
          const { messages } = res.body.errors[0];
          expect(field).to.be.equal('page');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"page" must be a number');
          return Promise.resolve(res);
        })
        .then((res) => {
          const { field } = res.body.errors[1];
          const { location } = res.body.errors[1];
          const { messages } = res.body.errors[1];
          expect(field).to.be.equal('perPage');
          expect(location).to.be.equal('query');
          expect(messages).to.include('"perPage" must be a number');
        });
    });
  });
});
