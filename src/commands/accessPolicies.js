const http = require('../modules/http');

module.exports = {
  about: 'Work with access policies (enterprise only).',
  firstArg: ['access-policies', 'ap'],
  operations: {
    createAccessPolicy: {
      execute: async ([, json]) => http.post('/accessPolicies', JSON.parse(json)),
      pattern: 'create $payload',
    },
    listAccessPolicies: {
      execute: async () => http.get('/accessPolicies'),
      pattern: 'list',
    },
    readAccessPolicy: {
      execute: async ([id]) => http.get(`/accessPolicies/${id}`),
      pattern: '$id read',
    },
    updateAccessPolicy: {
      execute: async ([id, , json]) => http.put(`/accessPolicies/${id}`, JSON.parse(json)),
      pattern: '$id update $payload',
    },
    deleteAccessPolicy: {
      execute: async ([id]) => http.delete(`/accessPolicies/${id}`),
      pattern: '$id delete',
    },
  },
};
