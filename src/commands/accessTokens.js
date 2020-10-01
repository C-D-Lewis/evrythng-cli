const http = require('../modules/http');
const util = require('../modules/util');

module.exports = {
  about: 'Work with access tokens (enterprise only).',
  firstArg: 'access-tokens',
  operations: {
    createAccessToken: {
      execute: async ([type, , json]) => {
        const payload = await util.getPayload('AccessTokenDocument', json);
        return http.post(`/accessTokens`, payload);
      },
      pattern: 'create $payload',
    },
    listAccessTokens: {
      execute: async ([type]) => http.get(`/accessTokens`),
      pattern: 'list',
    },
    readAccessToken: {
      execute: async ([type, id]) => http.get(`/accessTokens/${id}`),
      pattern: '$id read',
    },
    deleteAccessToken: {
      execute: async ([type, id]) => http.delete(`/accessTokens/${id}`),
      pattern: '$id delete',
    },
  },
};
