const Joi = require('joi');
const { cardConst } = require('../../config/vars');

const fullCardJOI = {
  body: {
    name: Joi.string().min(3).max(128).when('status', {
      is: cardConst.publishedState,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    imagePath: Joi.string().min(1).max(255).when('status', {
      is: cardConst.publishedState,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    rarity: Joi.string().min(1).max(60).when('status', {
      is: cardConst.publishedState,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    status: Joi.string().min(1).max(60),
    limit: Joi.number().integer(),
  },
};

module.exports = {

  // GET /v1/cards
  listCards: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },
  // POST /v1/cards
  createCard: { ...fullCardJOI },
  // PUT /v1/cards
  replaceCard: { ...fullCardJOI },
  // PATCH /v1/cards
  idsList: {
    cardIds: Joi.array().items(Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()),
  },
};
