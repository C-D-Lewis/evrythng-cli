const http = require('../modules/http');
const util = require('../modules/util');

module.exports = {
  about: 'Work with access policies (enterprise only).',
  firstArg: 'access-policies',
  operations: {
    createAccessPolicy: {
      execute: async ([type, , json]) => {
        const payload = await util.getPayload('AccessPolicyDocument', json);
        return http.post(`/accessPolicies`, payload);
      },
      pattern: 'create $payload',
    },
    listAccessPolicies: {
      execute: async ([type]) => http.get(`/accessPolicies`),
      pattern: 'list',
    },
    readAccessPolicy: {
      execute: async ([type, id]) => http.get(`/accessPolicies/${id}`),
      pattern: '$id read',
    },
    deleteAccessPolicy: {
      execute: async ([type, id]) => http.delete(`/accessPolicies/${id}`),
      pattern: '$id delete',
    },
  },
};
