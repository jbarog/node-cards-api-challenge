/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const { some, omitBy, isNil } = require('lodash');
const app = require('../../../index');
const { testCards, testUsers } = require('../values');
const Card = require('../../models/card.model');
const User = require('../../models/user.model');
const { cardConst } = require('../../../config/vars');

/**
 * root level hooks
 */

async function format(card) {
  const cardDb = (await Card.findOne({ name: card.name })).parseFields();
  delete cardDb.owner;
  return omitBy(cardDb, isNil);
}
function clearId(dbObject) {
  const parsedOject = { ...dbObject };
  const { id } = parsedOject;
  delete parsedOject.id;
  delete parsedOject.createdAt;
  delete parsedOject.subscriptions;
  return { parsedOject, id };
}

describe('Cards API', async () => {
  let creatorUserAccessToken;
  let consumerUserAccessToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
    await User.insertMany([testUsers.creator, testUsers.consumer]);
    await Card.insertMany([testCards.publishedCard, testCards.draftCard]);
    creatorUserAccessToken = testUsers.creator.token;
    consumerUserAccessToken = testUsers.consumer.token;
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
  });
  describe('GET /v1/cards', () => {
    it('creator should get all of his cards', () => {
      return request(app)
        .get('/v1/cards')
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const publishedCard = await format(testCards.publishedCard);
          const draftCard = await format(testCards.draftCard);

          const rows = res.body.map((row) => {
            const newRow = { ...row };
            newRow.createdAt = new Date(newRow.createdAt);
            return newRow;
          });

          const includesPublished = some(rows, publishedCard);
          const includesDraft = some(rows, draftCard);
          expect(rows).to.be.an('array');
          expect(rows).to.have.lengthOf(2);
          expect(includesPublished).to.equal(true, 'contains published');
          expect(includesDraft).to.equal(true, 'contains draft');
        });
    });
    it('cards pagination should work', () => {
      return request(app)
        .get('/v1/cards')
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .query({ page: 2, perPage: 1 })
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.an('object');
          expect(res.body).to.have.lengthOf(1);
        });
    });
    it('consumer should get all published cards', () => {
      return request(app)
        .get('/v1/cards')
        .set('Authorization', `Bearer ${consumerUserAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          const publishedCard = await format(testCards.publishedCard);
          const draftCard = await format(testCards.draftCard);

          const rows = res.body.map((row) => {
            const newRow = { ...row };
            newRow.createdAt = new Date(newRow.createdAt);
            return newRow;
          });

          const includesPublished = some(rows, publishedCard);
          const includesDraft = some(rows, draftCard);

          expect(rows).to.be.an('array');
          expect(rows).to.have.lengthOf(1);
          expect(includesPublished).to.be.true;
          expect(includesDraft).to.be.false;
        });
    });
  });
  describe('GET /v1/card/{idCard}', () => {
    it('creator should get any owned card', async () => {
      const { parsedOject: draftCard, id: cardId } = clearId(await format(testCards.draftCard));
      return request(app)
        .get(`/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .expect(httpStatus.OK)
        .then(async (res) => {
          expect(res.body).to.include(draftCard, 'no coincidence');
        });
    });
    it('non creator should not get any draft cards', async () => {
      const card = await format(testCards.draftCard);
      return request(app)
        .get(`/v1/cards/${card.id}`)
        .set('Authorization', `Bearer ${consumerUserAccessToken}`)
        .expect(httpStatus.UNAUTHORIZED);
    });
    it('should report a non existing cards', async () => {
      const cardId = '608f2fe9dc99bb0cfdbf7507';
      return request(app)
        .get(`/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${consumerUserAccessToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });
  describe('POST /v1/cards', () => {
    it('should create an incomplete draft card', () => {
      const protoDraftCard = { ...testCards.protoCard, status: cardConst.draftState };
      delete protoDraftCard.name;
      delete protoDraftCard.imagePath;
      delete protoDraftCard.rarity;
      return request(app)
        .post('/v1/cards')
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .send(protoDraftCard)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body).to.include(protoDraftCard, 'no coincidence');
        });
    });
    it('should create a complete draft card', () => {
      const protoDraftCard = { ...testCards.protoCard, status: cardConst.draftState };
      return request(app)
        .post('/v1/cards')
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .send(protoDraftCard)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          expect(res.body).to.include(protoDraftCard, 'no coincidence');
        });
    });
    it('should create a complete pusblished card and call analytics platforms', () => {
      const protoDraftCard = { ...testCards.protoCard, status: cardConst.publishedState };
      return request(app)
        .post('/v1/cards')
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .send(protoDraftCard)
        .expect(httpStatus.CREATED)
        .then(async (res) => {
          // TODO: Call analytics platforms expects
          expect(res.body).to.include(protoDraftCard, 'no coincidence');
        });
    });
    it('should not create an incomplete pusblished card', () => {
      const protoDraftCard = { ...testCards.protoCard, status: cardConst.publishedState };
      delete protoDraftCard.name;
      delete protoDraftCard.rarity;
      return request(app)
        .post('/v1/cards')
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .send(protoDraftCard)
        .expect(httpStatus.BAD_REQUEST);
    });
    it('should not create a duplicate of a published card', () => {
      const protoDraftCard = { ...testCards.publishedCard };
      return request(app)
        .post('/v1/cards')
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .send(protoDraftCard)
        .expect(httpStatus.CONFLICT);
    });
  });
  describe('PUT /v1/cards/{idCard}', () => {
    it('should edit an owned card and call analytics platforms', async () => {
      const { parsedOject: editedCard, id: cardId } = clearId(await format(testCards.draftCard));
      editedCard.name = 'card edited';
      editedCard.status = cardConst.publishedState;
      return request(app)
        .put(`/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .send(editedCard)
        .expect(httpStatus.OK)
        .then(async (res) => {
          // TODO: Call analytics platforms expects
          expect(res.body).to.include(editedCard, 'no coincidence');
        });
    });
    it('should not edit a non owned card', async () => {
      const {
        parsedOject: editedCard,
        id: cardId,
      } = clearId(await format(testCards.publishedCard));
      editedCard.name = 'card edited';
      return request(app)
        .put(`/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${consumerUserAccessToken}`)
        .send(editedCard)
        .expect(httpStatus.UNAUTHORIZED);
    });
    it('should not change to an incomplete pusblished card', async () => {
      const {
        parsedOject: editedCard,
        id: cardId,
      } = clearId(await format(testCards.publishedCard));
      editedCard.name = '';
      return request(app)
        .put(`/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .send(editedCard)
        .expect(httpStatus.BAD_REQUEST);
    });
    it('should not change to a duplicate of a published card', async () => {
      const { parsedOject, id: cardId } = clearId(await format(testCards.draftCard));
      const editedCard = { ...parsedOject, ...testCards.publishedCard };
      return request(app)
        .put(`/v1/cards/${cardId}`)
        .set('Authorization', `Bearer ${creatorUserAccessToken}`)
        .send(editedCard)
        .expect(httpStatus.CONFLICT);
    });
  });
});
