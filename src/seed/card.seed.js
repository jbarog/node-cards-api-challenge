const { cardConst } = require('../config/vars');

exports.cardModelPath = './src/api/models/card.model.js';
exports.cardModelName = 'Card';
exports.cardModelData = {
  model: 'Card',
  documents: [
    {
      name: 'Publised card 1',
      status: cardConst.publishedState,
      imagePath: 'https://static.streamloots.com/b355d1ef-d931-4c16-a48f-8bed0076401b/landing/ill-char-streamer_sing_star2x.png',
      rarity: cardConst.rareRarity,
      limit: 0,
      owner: '5a50159308f5a800111de759',
      subscriptions: [
        {
          subscriber: '5a50159308f5a800111de750',
          subscribeDate: new Date('Feb 3, 2021'),
          useDate: new Date('Feb 3, 2021'),
        },
        {
          subscriber: '5a50159308f5a800111de750',
          subscribeDate: new Date('Feb 4, 2021'),
        },
      ],
    },
  ],
};
