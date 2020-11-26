/**
 * (c) Copyright Reserved EVRYTHNG Limited 2019.
 * All rights reserved. Use of this material is subject to license.
 */

const http = require('../modules/http');

module.exports = {
  about: 'Work with purchase orders.',
  firstArg: ['purchase-orders', 'po'],
  operations: {
    createPurchaseOrder: {
      execute: async ([, json]) => http.post('/purchaseOrders', JSON.parse(json)),
      pattern: 'create $payload',
    },
    listPurchaseOrder: {
      execute: async () => http.get('/purchaseOrders'),
      pattern: 'list',
    },
    readPurchaseOrder: {
      execute: async ([purchaseOrderId]) => http.get(`/purchaseOrders/${purchaseOrderId}`),
      pattern: '$purchaseOrderId read',
    },
    updatePurchaseOrder: {
      execute: async ([purchaseOrderId, , json]) => http.put(`/purchaseOrders/${purchaseOrderId}`, JSON.parse(json)),
      pattern: '$purchaseOrderId update $payload',
    },
    deletePurchaseOrder: {
      execute: async ([purchaseOrderId]) => http.delete(`/purchaseOrders/${purchaseOrderId}`),
      pattern: '$purchaseOrderId delete',
    },
  },
};
