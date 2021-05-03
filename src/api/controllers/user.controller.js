const User = require('../models/user.model');

/**
 * Get user list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const users = await User.list(req.query);
    const transformedUsers = users.map(user => user.parseFields());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};
