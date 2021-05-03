const seeder = require('mongoose-seed');
const { mongo } = require('../config/vars');
const { cardModelPath, cardModelName, cardModelData } = require('./card.seed');
const { userModelPath, userModelName, userModelData } = require('./user.seed');

// Connect to MongoDB via Mongoose
seeder.connect(mongo.uri, () => {
  // Load Mongoose models
  seeder.loadModels([
    userModelPath,
    cardModelPath,
  ]);

  // Clear specified collections
  seeder.clearModels([userModelName, cardModelName], () => {
    // Callback to populate DB once collections have been cleared
    seeder.populateModels([userModelData, cardModelData], () => {
      seeder.disconnect();
    });
  });
});
