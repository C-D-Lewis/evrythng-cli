/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { ID, mockApi } = require('../util');
const cli = require('../../src/functions/cli');

describe('account-config', () => {
  it('should make correct request for \'account-config list\'', async () => {
    mockApi()
      .get('/accounts?perPage=30')
      .reply(200, [{
        id: ID,
        configuration: { brands: ['ACME Inc.'] },
      }]);

    await cli('account-config list');
  });

  it('should make correct request for \'account-config $name read\'', async () => {
    mockApi()
      .get('/accounts?perPage=30')
      .reply(200, [{
        id: ID,
        configuration: { brands: ['ACME Inc.'] },
      }]);

    await cli('account-config brands read');
  });

  it('should make correct request for \'account-config $name update $payload\'', async () => {
    mockApi()
      .get('/accounts?perPage=30')
      .reply(200, [{
        id: ID,
        configuration: { brands: ['ACME Inc.'] },
      }]);
    mockApi()
      .put(`/accounts/${ID}/configuration/brands`)
      .reply(200, ['ACME Inc.']);

    const payload = JSON.stringify({ brands: ['ACME Inc.'] });
    await cli(`account-config brands update ${payload}`);
  });

  it('should make correct request for \'account-config $name delete\'', async () => {
    mockApi()
      .get('/accounts?perPage=30')
      .reply(200, [{
        id: ID,
        configuration: { brands: ['ACME Inc.'] },
      }]);
    mockApi()
      .delete(`/accounts/${ID}/configuration/brands`)
      .reply(200);

    await cli('account-config brands delete');
  });
});
