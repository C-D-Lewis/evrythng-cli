/**
 * (c) Copyright Reserved EVRYTHNG Limited 2019.
 * All rights reserved. Use of this material is subject to license.
 */

const { mockApi } = require('../util');
const cli = require('../../src/functions/cli');

const shipmentNoticePayload = JSON.stringify({
  asnId: '9827429837429823828273',
  version: '1',
  issueDate: '2019-06-19T16:39:57-08:00',
  transportation: 'Expedited Freight',
  parties: [
    {
      id: 'gs1:414:01251',
      type: 'ship-from',
    },
    {
      name: 'The Landmark, Shop No. G14',
      type: 'ship-to',
      address: {
        street: '113-114, Central',
        city: 'Hong Kong',
      },
    },
  ],
  tags: [
    'ongoing',
    'important',
    'access-all',
  ],
});

describe('shipment-notices', async () => {
  it('should make correct request for \'shipment-notices create $payload\'', async () => {
    mockApi()
      .post('/shipmentNotices', shipmentNoticePayload)
      .reply(201, shipmentNoticePayload);

    await cli(`shipment-notices create ${shipmentNoticePayload}`);
  });

  it('should make correct request for \'shipment-notices $id read\'', async () => {
    mockApi()
      .get('/shipmentNotices/Ur2KGCnqbfsphqaabbcbsqnq')
      .reply(200, {});

    await cli('shipment-notices Ur2KGCnqbfsphqaabbcbsqnq read');
  });

  it('should make correct request for \'shipment-notices list\'', async () => {
    mockApi()
      .get('/shipmentNotices?perPage=30')
      .reply(200, {});

    await cli('shipment-notices list');
  });

  it('should make correct request for \'shipment-notices $id update $payload\'', async () => {
    mockApi()
      .put('/shipmentNotices/Ur2KGCnqbfsphqaabbcbsqnq', shipmentNoticePayload)
      .reply(200, shipmentNoticePayload);

    await cli(`shipment-notices Ur2KGCnqbfsphqaabbcbsqnq update ${shipmentNoticePayload}`);
  });

  it('should make correct request for \'shipment-notices $id delete\'', async () => {
    mockApi()
      .delete('/shipmentNotices/Ur2KGCnqbfsphqaabbcbsqnq')
      .reply(204);

    await cli('shipment-notices Ur2KGCnqbfsphqaabbcbsqnq delete');
  });

  it('should make correct request for \'asn list\'', async () => {
    mockApi()
      .get('/shipmentNotices?perPage=30')
      .reply(200, {});

    await cli('asn list');
  });
});
