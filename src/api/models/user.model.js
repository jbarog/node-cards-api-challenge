const mongoose = require('mongoose');

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
}, {
  timestamps: true,
});

/**
 * Methods
 */
userSchema.method({
  parseFields() {
    const parsed = {};
    const fields = ['id', 'name', 'createdAt'];

    fields.forEach((field) => {
      parsed[field] = this[field];
    });

    return parsed;
  },
});

/**
 * Statics
 */
userSchema.statics = {
  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30,
  }) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
