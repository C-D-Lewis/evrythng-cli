/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { NAME, ID, mockApi } = require('../util');
const cli = require('../../src/functions/cli');

describe('collections', () => {
  it('should make correct request for \'collections create $payload\'', async () => {
    const payload = JSON.stringify({ name: 'Test collection' });
    mockApi()
      .post('/collections', payload)
      .reply(201, {});

    await cli(`collections create ${payload}`);
  });

  it('should make correct request for \'collections list\'', async () => {
    mockApi()
      .get('/collections?perPage=30')
      .reply(200, {});

    await cli('collections list');
  });

  it('should make correct request for \'collections $id read\'', async () => {
    mockApi()
      .get(`/collections/${ID}`)
      .reply(200, {});

    await cli(`collections ${ID} read`);
  });

  it('should make correct request for \'collections $id update $payload\'', async () => {
    const payload = JSON.stringify({ description: 'Updated description' });
    mockApi()
      .put(`/collections/${ID}`, payload)
      .reply(200, {});

    await cli(`collections ${ID} update ${payload}`);
  });

  it('should make correct request for \'collections $id actions create $payload\'', async () => {
    const payload = JSON.stringify({ type: NAME });
    mockApi()
      .post(`/collections/${ID}/actions/all`, payload)
      .reply(201, {});

    await cli(`collections ${ID} actions create ${payload}`);
  });

  it('should make correct request for \'collections $id actions list\'', async () => {
    mockApi()
      .get(`/collections/${ID}/actions/all?perPage=30`)
      .reply(200, {});

    await cli(`collections ${ID} actions list`);
  });

  it('should make correct request for \'collections $id actions $id read\'', async () => {
    mockApi()
      .get(`/collections/${ID}/actions/all/${ID}`)
      .reply(200, {});

    await cli(`collections ${ID} actions ${ID} read`);
  });

  it('should make correct request for \'collections $id collections add $payload\'', async () => {
    const payload = JSON.stringify([ID]);
    mockApi()
      .post(`/collections/${ID}/collections`, payload)
      .reply(201, {});

    await cli(`collections ${ID} collections add ${payload}`);
  });

  it('should make correct request for \'collections $id collections list\'', async () => {
    mockApi()
      .get(`/collections/${ID}/collections?perPage=30`)
      .reply(200, {});

    await cli(`collections ${ID} collections list`);
  });

  it('should make correct request for \'collections $id collections $id delete\'', async () => {
    mockApi()
      .delete(`/collections/${ID}/collections/${ID}`)
      .reply(200, {});

    await cli(`collections ${ID} collections ${ID} delete`);
  });

  it('should make correct request for \'collections $id collections delete\'', async () => {
    mockApi()
      .delete(`/collections/${ID}/collections`)
      .reply(200, {});

    await cli(`collections ${ID} collections delete`);
  });

  it('should make correct request for \'collections $id thngs add $payload\'', async () => {
    const payload = JSON.stringify([ID]);
    mockApi()
      .put(`/collections/${ID}/thngs`, payload)
      .reply(200, {});

    await cli(`collections ${ID} thngs add ${payload}`);
  });

  it('should make correct request for \'collections $id thngs list\'', async () => {
    mockApi()
      .get(`/collections/${ID}/thngs?perPage=30`)
      .reply(200, {});

    await cli(`collections ${ID} thngs list`);
  });

  it('should make correct request for \'collections $id thngs $id delete\'', async () => {
    mockApi()
      .delete(`/collections/${ID}/thngs/${ID}`)
      .reply(200, {});

    await cli(`collections ${ID} thngs ${ID} delete`);
  });

  it('should make correct request for \'collections $id thngs delete\'', async () => {
    mockApi()
      .delete(`/collections/${ID}/thngs`)
      .reply(200, {});

    await cli(`collections ${ID} thngs delete`);
  });

  it('should make correct request for \'collections $id delete\'', async () => {
    mockApi()
      .delete(`/collections/${ID}`)
      .reply(200, {});

    await cli(`collections ${ID} delete`);
  });

  it('should make correct request for \'c list\'', async () => {
    mockApi()
      .get('/collections?perPage=30')
      .reply(200, {});

    await cli('c list');
  });
});
