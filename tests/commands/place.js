/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { ID, mockApi } = require('../util');
const cli = require('../../src/functions/cli');

describe('places', () => {
  it('should make correct request for \'places create $payload\'', async () => {
    const payload = JSON.stringify({ name: 'Test place' });
    mockApi()
      .post('/places', payload)
      .reply(201, {});

    await cli(`places create ${payload}`);
  });

  it('should make correct request for \'places list\'', async () => {
    mockApi()
      .get('/places?perPage=30')
      .reply(200, {});

    await cli('places list');
  });

  it('should make correct request for \'places $id read\'', async () => {
    mockApi()
      .get(`/places/${ID}`)
      .reply(200, {});

    await cli(`places ${ID} read`);
  });

  it('should make correct request for \'places $id update $payload\'', async () => {
    const payload = JSON.stringify({ tags: ['test'] });
    mockApi()
      .put(`/places/${ID}`, payload)
      .reply(200, {});

    await cli(`places ${ID} update ${payload}`);
  });

  it('should make correct request for \'places $id delete\'', async () => {
    mockApi()
      .delete(`/places/${ID}`)
      .reply(200, {});

    await cli(`places ${ID} delete`);
  });

  it('should make correct request for \'pl list\'', async () => {
    mockApi()
      .get('/places?perPage=30')
      .reply(200, {});

    await cli('pl list');
  });
});
