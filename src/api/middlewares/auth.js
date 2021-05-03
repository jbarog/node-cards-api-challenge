const httpStatus = require('http-status');
const jwt = require('jwt-simple');
const User = require('../models/user.model');
const APIError = require('../utils/APIError');

const checkIsLogged = async (req, res, next) => {
  // dumb check
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.decode(token, null, true);

    const user = await User.findById(decodedToken.userId);
    if (!user) {
      const userNotFoundError = {
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      };
      throw userNotFoundError;
    }
    req.loggedUser = user;

    return next();
  } catch (error) {
    const apiError = new APIError({
      message: error && error.message ? error.message : 'Unauthorized',
      status: error && error.status ? error.status : httpStatus.UNAUTHORIZED,
      stack: error && error.stack ? error.stack : undefined,
    });
    return next(apiError);
  }
};

exports.logged = () => checkIsLogged;
