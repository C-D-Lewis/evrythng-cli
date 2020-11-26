/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const csvFile = require('../modules/csvFile');
const http = require('../modules/http');
const jsonFile = require('../modules/jsonFile');
const switches = require('../modules/switches');
const util = require('../modules/util');

module.exports = {
  about: 'Work with Thng resources.',
  firstArg: ['thngs', 't'],
  operations: {
    // CRUD
    createThng: {
      execute: async ([, json]) => {
        if (switches.FROM_CSV) {
          return csvFile.read('thng');
        }
        if (switches.FROM_JSON) {
          return jsonFile.read('thng');
        }

        const payload = await util.getPayload('ThngDocument', json);
        return http.post('/thngs', payload);
      },
      pattern: 'create $payload',
      helpPattern: 'create [$payload|--build|--from-csv|--from-json]',
    },
    readThng: {
      execute: async ([id]) => http.get(`/thngs/${id}`),
      pattern: '$id read',
    },
    listThng: {
      execute: async () => http.get('/thngs'),
      pattern: 'list',
    },
    updateThng: {
      execute: async ([id, , json]) => http.put(`/thngs/${id}`, JSON.parse(json)),
      pattern: '$id update $payload',
    },
    updateThngs: {
      execute: async ([, json]) => {
        if (!switches.IDS) {
          throw new Error('--ids switch is required for bulk update');
        }

        return http.put('/thngs', JSON.parse(json));
      },
      pattern: 'update $payload',
      helpPattern: 'update $payload --ids <list of IDs>',
    },
    deleteThng: {
      execute: async ([id]) => http.delete(`/thngs/${id}`),
      pattern: '$id delete',
    },

    // Thng properties
    createProperty: {
      execute: async ([id, , , json]) => http.put(`/thngs/${id}/properties`, JSON.parse(json)),
      pattern: '$id properties create $payload',
    },
    listProperties: {
      execute: async ([id]) => http.get(`/thngs/${id}/properties`),
      pattern: '$id properties list',
    },
    readProperty: {
      execute: async ([id, , key]) => http.get(`/thngs/${id}/properties/${key}`),
      pattern: '$id properties $key read',
    },
    updateProperty: {
      execute: async ([id, , key, , json]) => {
        const url = `/thngs/${id}/properties/${key}`;
        return http.put(url, JSON.parse(json));
      },
      pattern: '$id properties $key update $payload',
    },
    deleteProperty: {
      execute: async ([id, , key]) => http.delete(`/thngs/${id}/properties/${key}`),
      pattern: '$id properties $key delete',
    },
    deleteProperties: {
      execute: async ([id]) => http.delete(`/thngs/${id}/properties`),
      pattern: '$id properties delete',
    },

    // Thng actions
    createThngAction: {
      execute: async ([id, , , json]) => {
        const payload = JSON.parse(json);
        return http.post(`/thngs/${id}/actions/all`, payload);
      },
      pattern: '$id actions create $payload',
    },
    listThngActions: {
      execute: async ([id]) => http.get(`/thngs/${id}/actions/all`),
      pattern: '$id actions list',
    },
    readThngAction: {
      execute: async ([thngId, , actionId]) => {
        const url = `/thngs/${thngId}/actions/all/${actionId}`;
        return http.get(url);
      },
      pattern: '$id actions $id read',
    },

    // Thng commissions
    createThngCommissionsAction: {
      execute: async ([identifier, , , , json]) => {
        const payload = JSON.parse(json);
        return http.post(`/thngs/${identifier}/actions/commissions`, payload);
      },
      pattern: '$identifier actions commissions create $payload',
      helpPattern: '$identifier|$id actions commissions create $payload',
    },
    readThngCommissionState: {
      execute: async ([identifier]) => http.get(`/thngs/${identifier}/commissionState`),
      pattern: '$identifier commission-state read',
      helpPattern: '$identifier|$id commission-state read',
    },
    createThngDecommissionsAction: {
      execute: async ([identifier, , , , json]) => {
        const payload = JSON.parse(json);
        return http.post(`/thngs/${identifier}/actions/decommissions`, payload);
      },
      pattern: '$identifier actions decommissions create $payload',
      helpPattern: '$identifier|$id actions decommissions create $payload',
    },

    // Thng redirection
    createThngRedirection: {
      execute: async ([id, , shortDomain, , json]) => {
        const body = Object.assign(JSON.parse(json), { evrythngId: id, type: 'thng' });
        return http.shortDomainRequest(shortDomain, {
          method: 'post',
          body: JSON.stringify(body),
        });
      },
      pattern: '$id redirections $shortDomain create $payload',
    },
    listThngRedirections: {
      execute: async ([id, , shortDomain]) => http.shortDomainRequest(shortDomain, {
        params: { evrythngId: id },
      }),
      pattern: '$id redirections $shortDomain list',
    },
    updateThngRedirection: {
      execute: async ([, , shortDomain, shortId, , body]) => http.shortDomainRequest(
        shortDomain,
        {
          url: `/redirections/${shortId}`,
          method: 'put',
          body,
        },
      ),
      pattern: '$id redirections $shortDomain $shortId update $payload',
    },
    deleteThngRedirection: {
      execute: async ([, , shortDomain, shortId]) => http.shortDomainRequest(shortDomain, {
        url: `/redirections/${shortId}`,
        method: 'delete',
      }),
      pattern: '$id redirections $shortDomain $shortId delete',
    },

    // Thng location
    readThngLocation: {
      execute: async ([id]) => http.get(`/thngs/${id}/location`),
      pattern: '$id location read',
    },
    updateThngLocation: {
      execute: async ([id, , , json]) => http.put(`/thngs/${id}/location`, JSON.parse(json)),
      pattern: '$id location update $payload',
    },
    deleteThngLocation: {
      execute: async ([id]) => http.delete(`/thngs/${id}/location`),
      pattern: '$id location delete',
    },

    // Device API Key
    createThngDeviceKey: {
      execute: async ([, , json]) => http.post('/auth/evrythng/thngs', JSON.parse(json)),
      pattern: 'device-key create $payload',
    },
    readThngDeviceKey: {
      execute: async ([id]) => http.get(`/auth/evrythng/thngs/${id}`),
      pattern: '$id device-key read',
    },
    deleteThngDeviceKey: {
      execute: async ([id]) => http.delete(`/auth/evrythng/thngs/${id}`),
      pattern: '$id device-key delete',
    },
  },
};
