/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const nock = require('nock');
const { ID, NAME, mockApi } = require('../util');
const cli = require('../../src/functions/cli');
const switches = require('../../src/modules/switches');

describe('products', () => {
  // Product CRUD
  it('should make correct request for \'products create $payload\'', async () => {
    const payload = JSON.stringify({ name: 'Test product' });
    mockApi()
      .post('/products', payload)
      .reply(201, {});

    await cli(`products create ${payload}`);
  });

  it('should make correct request for \'products list\'', async () => {
    mockApi()
      .get('/products?perPage=30')
      .reply(200, {});

    await cli('products list');
  });

  it('should make correct request for \'products $id read\'', async () => {
    mockApi()
      .get(`/products/${ID}`)
      .reply(200, {});

    await cli(`products ${ID} read`);
  });

  it('should make correct request for \'products $id update $payload\'', async () => {
    const payload = JSON.stringify({ tags: ['test'] });
    mockApi()
      .put(`/products/${ID}`, payload)
      .reply(200, {});

    await cli(`products ${ID} update ${payload}`);
  });

  it('should make correct request for \'products update $payload --ids\'', async () => {
    const payload = JSON.stringify({ tags: ['test'] });
    mockApi()
      .put('/products?ids=Up5dVdGwhqSrY5aRwneKddgb%2CUKgVb5QFfRtNQBRRw2Dxmkar', payload)
      .reply(200, {});

    await cli(`products update ${payload} --ids Up5dVdGwhqSrY5aRwneKddgb,UKgVb5QFfRtNQBRRw2Dxmkar`);

    switches.IDS = false;
  });

  // Product properties
  it('should make correct request for \'products $id properties create $payload\'', async () => {
    const payload = JSON.stringify([{ key: NAME, value: 'some value' }]);
    mockApi()
      .put(`/products/${ID}/properties`, payload)
      .reply(200, {});

    await cli(`products ${ID} properties create ${payload}`);
  });

  it('should make correct request for \'products $id properties list\'', async () => {
    mockApi()
      .get(`/products/${ID}/properties?perPage=30`)
      .reply(200, {});

    await cli(`products ${ID} properties list`);
  });

  it('should make correct request for \'products $id properties $key read\'', async () => {
    mockApi()
      .get(`/products/${ID}/properties/${NAME}?perPage=30`)
      .reply(200, {});

    await cli(`products ${ID} properties ${NAME} read`);
  });

  it('should make correct request for \'products $id properties $key update $payload\'',
    async () => {
      const payload = JSON.stringify([{ value: 'some value' }]);
      mockApi()
        .put(`/products/${ID}/properties/${NAME}`, payload)
        .reply(200, {});

      await cli(`products ${ID} properties ${NAME} update ${payload}`);
    });

  it('should make correct request for \'products $id properties $key delete\'', async () => {
    mockApi()
      .delete(`/products/${ID}/properties/${NAME}`)
      .reply(200, {});

    await cli(`products ${ID} properties ${NAME} delete`);
  });

  // Product actions
  it('should make correct request for \'products $id actions create $payload\'', async () => {
    const payload = JSON.stringify({ type: NAME });
    mockApi()
      .post(`/products/${ID}/actions/all`, payload)
      .reply(201, {});

    await cli(`products ${ID} actions create ${payload}`);
  });

  it('should make correct request for \'products $id actions list\'', async () => {
    mockApi()
      .get(`/products/${ID}/actions/all?perPage=30`)
      .reply(200, {});

    await cli(`products ${ID} actions list`);
  });

  it('should make correct request for \'products $id actions $id read\'', async () => {
    mockApi()
      .get(`/products/${ID}/actions/all/${ID}`)
      .reply(200, {});

    await cli(`products ${ID} actions ${ID} read`);
  });

  // Product redirection
  it('should make correct request for \'products $id redirections $shortDomain create $payload\'',
    async () => {
      const payload = JSON.stringify({
        defaultRedirectUrl: 'https://google.com/{shortId}/',
        type: 'product',
        evrythngId: ID
      });
      nock('https://tn.gg')
        .post('/redirections', payload)
        .reply(201, {});

      await cli(`products ${ID} redirections tn.gg create ${payload}`);
    }
  );

  it('should make correct request for \'products $id redirections $shortDomain list\'', async () => {
    nock('https://tn.gg')
      .get(`/redirections?evrythngId=${ID}`)
      .reply(200, [{}]);

    await cli(`products ${ID} redirections tn.gg list`);
  });

  it(
    'should make correct request for \'products $id redirections $shortDomain $shortId update $payload\'',
    async () => {
      const payload = JSON.stringify({ defaultRedirectUrl: 'https://google.com/{shortId}/updates/' });
      nock('https://tn.gg')
        .put('/redirections/foo', payload)
        .reply(200, {});

      await cli(`products ${ID} redirections tn.gg foo update ${payload}`);
    }
  );

  it('should make correct request for \'products $id redirections $shortDomain $shortId delete\'',
    async () => {
      nock('https://tn.gg')
        .delete('/redirections/foo')
        .reply(200);

      await cli(`products ${ID} redirections tn.gg foo delete`);
    }
  );

  // Finally
  it('should make correct request for \'products $id delete\'', async () => {
    mockApi()
      .delete(`/products/${ID}`)
      .reply(200, {});

    await cli(`products ${ID} delete`);
  });

  it('should make correct request for \'pr list\'', async () => {
    mockApi()
      .get('/products?perPage=30')
      .reply(200, {});

    await cli('pr list');
  });
});
