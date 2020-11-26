/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const http = require('../modules/http');
const util = require('../modules/util');

module.exports = {
  about: 'Work with actions.',
  firstArg: ['actions', 'a'],
  operations: {
    createAction: {
      execute: async ([type, , json]) => {
        const payload = await util.getPayload('ActionDocument', json);
        return http.post(`/actions/${type}`, payload);
      },
      pattern: '$type create $payload',
      helpPattern: '$type create [$payload|--build]',
    },
    listActions: {
      execute: async ([type]) => http.get(`/actions/${type}`),
      pattern: '$type list',
    },
    readAction: {
      execute: async ([type, id]) => http.get(`/actions/${type}/${id}`),
      pattern: '$type $id read',
    },
    deleteAction: {
      execute: async ([type, id]) => http.delete(`/actions/${type}/${id}`),
      pattern: '$type $id delete',
    },
  },
};
