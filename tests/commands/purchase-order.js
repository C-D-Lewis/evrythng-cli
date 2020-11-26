/**
 * (c) Copyright Reserved EVRYTHNG Limited 2019.
 * All rights reserved. Use of this material is subject to license.
 */

const { ID, mockApi } = require('../util');
const cli = require('../../src/functions/cli');

describe('purchase-orders', async () => {
  it('should make correct request for \'purchase-orders create $payload\'', async () => {
    const payload = JSON.stringify({
      id: '234567890',
      status: 'open',
      type: 'stand-alone',
      description: 'A purchase order for 100 items',
      issueDate: '2019-02-14',
      parties: [
        {
          id: 'gs1:414:943234',
          type: 'supplier'
        },
        {
          id: 'gs1:414:01251',
          type: 'ship-from'
        },
        {
          id: 'gs1:414:NA0193',
          type: 'ship-to'
        }
      ],
      lines: [
        {
          id: '00010',
          quantity: 100,
          product: 'gs1:01:00000123456789',
          exportDate: '2019-02-17',
          deliveryDate: '2019-02-20'
        }
      ]
    });
    mockApi()
      .post('/purchaseOrders', payload)
      .reply(201, {});

    await cli(`purchase-orders create ${payload}`);
  });

  it('should make correct request for \'purchase-orders list\'', async () => {
    mockApi()
      .get('/purchaseOrders?perPage=30')
      .reply(200, {});

    await cli('purchase-orders list');
  });

  it('should make correct request for \'purchase-orders $id read\'', async () => {
    mockApi()
      .get('/purchaseOrders/234567890?perPage=30')
      .reply(200, {});

    await cli('purchase-orders 234567890 read');
  });

  it('should make correct request for \'purchase-orders $id update $payload\'', async () => {
    const payload = JSON.stringify({
      id: '234567890',
      status: 'open',
      type: 'stand-alone',
      description: 'A purchase order for 100 items',
      issueDate: '2019-02-14',
      parties: [
        {
          id: 'gs1:414:943234',
          type: 'supplier'
        },
        {
          id: 'gs1:414:01251',
          type: 'ship-from'
        },
        {
          id: 'gs1:414:NA0193',
          type: 'ship-to'
        }
      ],
      lines: [
        {
          id: '00010',
          quantity: 150,
          product: 'gs1:01:00000123456789',
          exportDate: '2019-02-17',
          deliveryDate: '2019-02-20'
        }
      ]
    });
    mockApi()
      .put('/purchaseOrders/234567890', payload)
      .reply(200, {});

    await cli(`purchase-orders 234567890 update ${payload}`);
  });

  it('should make correct request for \'purchase-orders $id delete\'', async () => {
    mockApi()
      .delete('/purchaseOrders/234567890')
      .reply(204);

    await cli('purchase-orders 234567890 delete');
  });

  it('should make correct request for \'po list\'', async () => {
    mockApi()
      .get('/purchaseOrders?perPage=30')
      .reply(200, {});

    await cli('po list');
  });
});
