/**
 * (c) Copyright Reserved EVRYTHNG Limited 2019.
 * All rights reserved. Use of this material is subject to license.
 */

const http = require('../modules/http');

module.exports = {
  about: 'Work with shipment notices.',
  firstArg: ['shipment-notices', 'asn'],
  operations: {
    createShipmentNotice: {
      execute: async ([, json]) => http.post('/shipmentNotices', JSON.parse(json)),
      pattern: 'create $payload',
    },
    listShipmentNotices: {
      execute: async () => http.get('/shipmentNotices'),
      pattern: 'list',
    },
    readShipmentNotice: {
      execute: async ([id]) => http.get(`/shipmentNotices/${id}`),
      pattern: '$id read',
    },
    updateShipmentNotice: {
      execute: async ([id, , json]) => http.put(`/shipmentNotices/${id}`, JSON.parse(json)),
      pattern: '$id update $payload',
    },
    deleteShipmentNotice: {
      execute: async ([id]) => http.delete(`/shipmentNotices/${id}`),
      pattern: '$id delete',
    },
  },
};
