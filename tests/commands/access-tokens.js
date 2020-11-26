/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { mockApi } = require('../util');
const cli = require('../../src/functions/cli');

describe('access-tokens', () => {
  it('should make correct request for \'access-tokens create $payload\'', async () => {
    const payload = JSON.stringify({
      name: 'Token Name',
      description: 'Mobile application access token',
      policies: ['UPb7Eq8hwpktcaaabfahfpdq'],
      conditions: ['factoryId:U8wQCBT7KXa4xHc5aCQk5pab'],
      identifiers: {},
      tags: [],
      customFields: {},
    });
    mockApi()
      .post('/accessTokens', payload)
      .reply(201, {});

    await cli(`access-tokens create ${payload}`);
  });

  it('should make correct request for \'access-tokens list\'', async () => {
    mockApi()
      .get('/accessTokens?perPage=30')
      .reply(200, []);

    await cli('access-tokens list');
  });

  it('should make correct request for \'at list\'', async () => {
    mockApi()
      .get('/accessTokens?perPage=30')
      .reply(200, []);

    await cli('at list');
  });
});
