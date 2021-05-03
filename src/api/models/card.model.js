const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const { omit } = require('lodash');

const { cardConst } = require('../../config/vars');

/**
* Card rarities
*/
const rarities = [
  cardConst.standardRarity,
  cardConst.rareRarity,
];
/**
* Card statuses
*/
const statuses = [
  cardConst.draftState,
  cardConst.publishedState,
  cardConst.deletedState,
];

/**
 * Card Schema
 * @private
 */
const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    trim: true,
  },
  imagePath: {
    type: String,
    maxlength: 255,
    trim: true,
  },
  rarity: {
    type: String,
    enum: rarities,
    default: 'standard',
  },
  limit: {
    type: Number,
    min: [0, 'only natural numbers'],
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    },
  },
  status: {
    type: String,
    enum: statuses,
    default: 'draft',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscriptions: [{
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscribeDate: {
      type: Date,
      required: true,
    },
    useDate: {
      type: Date,
    },
  }],
}, {
  timestamps: true,
});
// /**
//  * Index
//  */
// cardSchema.index({name: 1,img: 1,rarity: 1}, { unique: true });

/**
 * Methods
 */
cardSchema.method({
  parseFields() {
    const parsed = {};
    const fields = ['id', 'name', 'imagePath', 'status', 'rarity', 'limit', 'owner', 'createdAt', 'subscriptions'];

    fields.forEach((field) => {
      parsed[field] = this[field];
    });
    return parsed;
  },
});
/**
 * Statics
 */
cardSchema.statics = {

  rarities,
  statuses,

  /**
   * get card
   *
   * @param {ObjectId} cardId - card Id
   * @param {ObjectId} userId - User Id
   * @returns {Promise<Card[]>}
   */
  getOne(cardId, userId) {
    const listCondition = {
      _id: cardId,
      $or: [
        { status: cardConst.publishedState },
      ],
    };
    if (userId) {
      listCondition.$or.push({ owner: userId });
    }
    return this.findOne(listCondition)
      .populate('owner')
      .exec();
  },
  /**
   * List cards in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of cards to be skipped.
   * @param {number} limit - Limit number of cards to be returned.
   * @returns {Promise<Card[]>}
   */
  list({
    page = 1, perPage = 30,
  }, userId) {
    const listCondition = {
      $or: [
        { status: cardConst.publishedState },
      ],
    };
    if (userId) {
      listCondition.$or.push({ owner: userId });
    }
    return this.find(listCondition)
      .populate('owner')
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
  /**
   * replace a card by id
   *
   * @param {Object}   card - User Id
   * @param {ObjectId} cardId - card Id
   * @param {ObjectId} userId - User Id
   * @returns {Promise<Card[]>}
   */
  async replace(newCard, cardId, userId) {
    const replaceCondition = {
      _id: cardId,
      owner: userId,
    };
    const prevCard = await this.findOne(replaceCondition).exec();
    const newCardParsed = omit(newCard.toObject(), '_id');
    if (prevCard) {
      await prevCard.updateOne(newCardParsed, { override: true, upsert: true });
      return this.findById(prevCard._id)
        .populate('owner')
        .exec();
    }
    return false;
  },
  /**
  * Check if ther is a previous card published with same values
  *
  * @param {Object} card - card object
  * @returns {Boolean}
  */
  async checkDuplicateCard({
    name, imagePath, rarity, status, cardId,
  }) {
    const isPublished = status === cardConst.publishedState;
    const condition = {
      name,
      imagePath,
      rarity,
      status,
      ...(cardId ? { _id: { $ne: cardId } } : {}),
    };
    if (isPublished) {
      return this.findOne(condition).exec();
    }
    return false;
  },
  /**
   * Return new duplication error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  duplicateCardError() {
    return new APIError({
      message: 'Duplication Error',
      status: httpStatus.CONFLICT,
    });
  },
  /**
   * Return new not allowed error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  notAllowedError() {
    return new APIError({
      message: 'not allowed Error',
      status: httpStatus.UNAUTHORIZED,
    });
  },
  /**
   * Return new error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  notFoundError(error) {
    return new APIError({
      message: 'Not found',
      status: httpStatus.NOT_FOUND,
      isPublic: true,
      stack: error.stack,
    });
  },
  /**
   * Return new error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  errorCard(error) {
    return new APIError({
      message: 'Validation Error',
      status: httpStatus.BAD_REQUEST,
      isPublic: true,
      stack: error.stack,
    });
  },
};

/**
 * @typedef Card
 */
module.exports = mongoose.model('Card', cardSchema);
