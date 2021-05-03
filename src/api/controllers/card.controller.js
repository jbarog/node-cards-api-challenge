const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Card = require('../models/card.model');

const duplicatedError = 'duplicatedError';
const notAllowedError = 'notAllowedError';
const notFoundError = 'notFoundError';
/**
 * Load card and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
  try {
    const objectId = mongoose.Types.ObjectId(id);
    const card = await Card.findById(objectId).exec();
    if (id && !card) {
      throw notFoundError;
    }
    req.currentCard = card;
    return next();
  } catch (error) {
    if (error === notFoundError) {
      return next(Card.notFoundError(error));
    }
    return next(error);
  }
};

/**
 * Get card list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const currentUser = req.loggedUser;
    const cards = await Card.list(req.query, currentUser._id);
    const transformedCards = cards.map(card => card.parseFields(currentUser.id));
    res.json(transformedCards);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single card
 * @public
 */
exports.get = async (req, res, next) => {
  try {
    const currentUser = req.loggedUser;
    const card = await Card.getOne(req.currentCard._id, currentUser._id);
    if (!card) {
      throw notAllowedError;
    }
    const transformedCard = card.parseFields(currentUser.id);
    res.json(transformedCard);
  } catch (error) {
    if (error === notAllowedError) {
      next(Card.notAllowedError(error));
    } else {
      next(Card.errorCard(error));
    }
  }
};

/**
 * replace card
 * @public
 */
exports.replace = async (req, res, next) => {
  try {
    const { body } = req;
    const isDuplicated = await Card.checkDuplicateCard({ ...body, cardId: req.currentCard._id });
    if (isDuplicated) {
      throw duplicatedError;
    }
    const newCard = new Card(body);
    const card = await Card.replace(newCard, req.currentCard._id, req.loggedUser._id);
    if (!card) {
      throw notAllowedError;
    }
    res.json(card);
  } catch (error) {
    if (error === notAllowedError) {
      next(Card.notAllowedError());
    } else if (error === duplicatedError) {
      next(Card.duplicateCardError());
    } else {
      next(Card.errorCard(error));
    }
  }
};

/**
 * Create new card
 * @public
 */
exports.create = async (req, res, next) => {
  try {
    const { body } = req;
    const isDuplicated = await Card.checkDuplicateCard(body);
    if (isDuplicated) {
      throw duplicatedError;
    }
    const cardParams = { ...body, owner: req.loggedUser._id };
    const newCard = new Card(cardParams);
    const savedCard = await newCard.save().then(t => t.populate('owner').execPopulate());
    res.status(httpStatus.CREATED);
    res.json(savedCard.parseFields());
  } catch (error) {
    if (error === duplicatedError) {
      next(Card.duplicateCardError());
    } else {
      next(Card.errorCard(error));
    }
  }
};
/**
 * Bulk publish card
 * @public
 */
exports.bulkPublish = async (req, res, next) => {
  try {
    const { cardIds } = req.body;
    console.log(cardIds);
  } catch (error) {
    if (error === duplicatedError) {
      next(Card.duplicateCardError());
    } else {
      next(Card.errorCard(error));
    }
  }
};
/**
 * Bulk subscribe card
 * @public
 */
exports.bulkSubscribe = async (req, res, next) => {
  try {
    const { cardIds } = req.body;
    console.log(cardIds);
  } catch (error) {
    if (error === duplicatedError) {
      next(Card.duplicateCardError());
    } else {
      next(Card.errorCard(error));
    }
  }
};
/**
 * Bulk use card
 * @public
 */
exports.bulkUse = async (req, res, next) => {
  try {
    const { cardIds } = req.body;
    console.log(cardIds);
  } catch (error) {
    if (error === duplicatedError) {
      next(Card.duplicateCardError());
    } else {
      next(Card.errorCard(error));
    }
  }
};
