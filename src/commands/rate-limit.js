/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const http = require('../modules/http');

module.exports = {
  about: 'View rate limit information',
  firstArg: 'rate-limits',
  operations: {
    read: {
      execute: async () => http.get('/rateLimits'),
      pattern: 'read',
    },
  },
};
