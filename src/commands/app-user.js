/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const http = require('../modules/http');
const util = require('../modules/util');

module.exports = {
  about: 'Work with Application User resources.',
  firstArg: ['app-users', 'au'],
  operations: {
    createApplicationUser: {
      execute: async ([, json]) => {
        util.requireKey('Application');

        return http.post('/auth/evrythng/users', JSON.parse(json));
      },
      pattern: 'create $payload',
    },
    validateApplicationUser: {
      execute: async ([id, , json]) => {
        util.requireKey('Application');

        return http.post(`/auth/evrythng/users/${id}/validate`, JSON.parse(json));
      },
      pattern: '$id validate $payload',
    },
    createAnonymousApplicationUser: {
      execute: async () => {
        util.requireKey('Application');

        const payload = { anonymous: true };
        return http.post('/auth/evrythng/users?anonymous=true', payload);
      },
      pattern: 'anonymous create',
    },
    readApplicationUser: {
      execute: async ([id]) => http.get(`/users/${id}`),
      pattern: '$id read',
    },
    listApplicationUsers: {
      execute: async () => http.get('/users'),
      pattern: 'list',
    },
    updateApplicationUser: {
      execute: async ([id, , json]) => http.put(`/users/${id}`, JSON.parse(json)),
      pattern: '$id update $payload',
    },
    deleteApplicationUser: {
      execute: async ([id]) => http.delete(`/users/${id}`),
      pattern: '$id delete',
    },
    logInApplicationUser: {
      execute: async ([, json]) => {
        util.requireKey('Application');
        return http.post('/users/login', JSON.parse(json));
      },
      pattern: 'login $payload',
    },
    logOutApplicationUser: {
      execute: async () => {
        util.requireKey('Application User');
        return http.post('/auth/all/logout');
      },
      pattern: 'logout',
    },
  },
};
