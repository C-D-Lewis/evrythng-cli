/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { ID, mockApi } = require('../util');
const cli = require('../../src/functions/cli');

describe('access-policies', () => {
  it('should make correct request for \'access-policies create $payload\'', async () => {
    const payload = JSON.stringify({
      name: 'FactoryAdministratorPolicy',
      permissions: [
        'actions:create',
        'places:list,read,update',
        'products:list,read',
        'purchaseOrders:list,read',
        'thngs:read',
      ],
    });
    mockApi()
      .post('/accessPolicies', payload)
      .reply(201, {});

    await cli(`access-policies create ${payload}`);
  });

  it('should make correct request for \'access-policies list\'', async () => {
    mockApi()
      .get('/accessPolicies?perPage=30')
      .reply(200, []);

    await cli('access-policies list');
  });

  it('should make correct request for \'access-policies $id read\'', async () => {
    mockApi()
      .get(`/accessPolicies/${ID}`)
      .reply(200, {});

    await cli(`access-policies ${ID} read`);
  });

  it('should make correct request for \'access-policies $id update $payload\'', async () => {
    const payload = JSON.stringify({ name: 'New Policy Name' });
    mockApi()
      .put(`/accessPolicies/${ID}`, payload)
      .reply(200, {});

    await cli(`access-policies ${ID} update ${payload}`);
  });

  it('should make correct request for \'access-policies $id delete\'', async () => {
    mockApi()
      .delete(`/accessPolicies/${ID}`)
      .reply(204);

    await cli(`access-policies ${ID} delete`);
  });

  it('should make correct request for \'ap list\'', async () => {
    mockApi()
      .get('/accessPolicies?perPage=30')
      .reply(200, []);

    await cli('ap list');
  });
});
