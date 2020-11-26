const http = require('../modules/http');

module.exports = {
  about: 'Work with access tokens (enterprise only).',
  firstArg: ['access-tokens', 'at'],
  operations: {
    createAccessToken: {
      execute: async ([, json]) => http.post('/accessTokens', JSON.parse(json)),
      pattern: 'create $payload',
    },
    listAccessTokens: {
      execute: async () => http.get('/accessTokens'),
      pattern: 'list',
    },
  },
};
