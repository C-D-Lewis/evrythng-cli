/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { API_KEY, ID, mockApi } = require('../util');
const cli = require('../../src/functions/cli');
const switches = require('../../src/modules/switches');

describe('accesses', () => {
  afterEach(() => {
    switches.API_KEY = false;
  });

  it('should make correct request for \'accesses create $payload\'', async () => {
    const payload = JSON.stringify({
      email: 'user2@example.com',
      role: 'base_app_user',
    });
    mockApi()
      .matchHeader('authorization', API_KEY)
      .post('/accesses', payload)
      .reply(201, {});

    await cli(`accesses create ${payload} --api-key ${API_KEY}`);
  });

  it('should make correct request for \'accesses list\'', async () => {
    mockApi()
      .matchHeader('authorization', API_KEY)
      .get('/accesses?perPage=30')
      .reply(200, {});

    await cli(`accesses list --api-key ${API_KEY}`);
  });

  it('should make correct request for \'accesses delete\'', async () => {
    mockApi()
      .matchHeader('authorization', API_KEY)
      .delete(`/accesses/${ID}`)
      .reply(204);

    await cli(`accesses ${ID} delete --api-key ${API_KEY}`);
  });
});
