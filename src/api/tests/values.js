const { cardConst } = require('../../config/vars');

exports.testUsers = {
  creator: {
    _id: '5a50159308f5a800111de759',
    name: 'Creator',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdHJlYW1sb290cy5jb20iLCJ1c2VySWQiOiI1YTUwMTU5MzA4ZjVhODAwMTExZGU3NTkiLCJpYXQiOjE1MTYyMzkwMjJ9.mj8-t--lfImQGg8HoA_9XOvDlunl3YJoPttkIbOHNMU',
  },
  consumer: {
    _id: '5a50159308f5a800111de750',
    name: 'Consumer',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdHJlYW1sb290cy5jb20iLCJ1c2VySWQiOiI1YTUwMTU5MzA4ZjVhODAwMTExZGU3NTAiLCJpYXQiOjE1MTYyMzkwMjJ9.ArXF6iD5tX0DkKiS0EG3y30Bl3g_E8iLPkk98hJw0Pc',
  },
};
exports.testCards = {
  publishedCard: {
    name: 'Card published',
    status: cardConst.publishedState,
    imagePath: 'https://static.streamloots.com/b355d1ef-d931-4c16-a48f-8bed0076401b/landing/ill-char-streamer_sing_star2x.png',
    rarity: cardConst.rareRarity,
    limit: 0,
    owner: '5a50159308f5a800111de759',
  },
  draftCard: {
    name: 'Card draft',
    status: cardConst.draftState,
    imagePath: 'https://static.streamloots.com/b355d1ef-d931-4c16-a48f-8bed0076401b/landing/ill-char-streamer_sing_star2x.png',
    rarity: cardConst.rareRarity,
    limit: 0,
    owner: '5a50159308f5a800111de759',
  },
  protoCard: {
    name: 'Card draft',
    imagePath: 'https',
    rarity: cardConst.rareRarity,
    limit: 0,
  },
};
