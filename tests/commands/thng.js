/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const nock = require('nock');
const { ID, NAME, mockApi } = require('../util');
const cli = require('../../src/functions/cli');
const switches = require('../../src/modules/switches');

describe('thngs', () => {
  // Thng CRUD
  it('should make correct request for \'thngs create $payload\'', async () => {
    const payload = JSON.stringify({ name: 'Test thng' });
    mockApi()
      .post('/thngs', payload)
      .reply(201, {});

    await cli(`thngs create ${payload}`);
  });

  it('should make correct request for \'thngs list\'', async () => {
    mockApi()
      .get('/thngs?perPage=30')
      .reply(200, {});

    await cli('thngs list');
  });

  it('should make correct request for \'thngs $id read\'', async () => {
    mockApi()
      .get(`/thngs/${ID}`)
      .reply(200, {});

    await cli(`thngs ${ID} read`);
  });

  it('should make correct request for \'thngs $id update $payload\'', async () => {
    const payload = JSON.stringify({ tags: ['test'] });
    mockApi()
      .put(`/thngs/${ID}`, payload)
      .reply(200, {});

    await cli(`thngs ${ID} update ${payload}`);
  });

  it('should make correct request for \'thngs update $payload --ids\'', async () => {
    const payload = JSON.stringify({ tags: ['test'] });
    mockApi()
      .put('/thngs?ids=Up5dVdGwhqSrY5aRwneKddgb%2CUKgVb5QFfRtNQBRRw2Dxmkar', payload)
      .reply(200, {});

    await cli(`thngs update ${payload} --ids Up5dVdGwhqSrY5aRwneKddgb,UKgVb5QFfRtNQBRRw2Dxmkar`);

    switches.IDS = false;
  });

  // Thng properties
  it('should make correct request for \'thngs $id properties create $payload\'', async () => {
    const payload = JSON.stringify([{ key: NAME, value: 'some value' }]);
    mockApi()
      .put(`/thngs/${ID}/properties`, payload)
      .reply(200, {});

    await cli(`thngs ${ID} properties create ${payload}`);
  });

  it('should make correct request for \'thngs $id properties list\'', async () => {
    mockApi()
      .get(`/thngs/${ID}/properties?perPage=30`)
      .reply(200, {});

    await cli(`thngs ${ID} properties list`);
  });

  it('should make correct request for \'thngs $id properties $key read\'', async () => {
    mockApi()
      .get(`/thngs/${ID}/properties/${NAME}?perPage=30`)
      .reply(200, {});

    await cli(`thngs ${ID} properties ${NAME} read`);
  });

  it('should make correct request for \'thngs $id properties $key update $payload\'', async () => {
    const payload = JSON.stringify([{ value: 'some value' }]);
    mockApi()
      .put(`/thngs/${ID}/properties/${NAME}`, payload)
      .reply(200, {});

    await cli(`thngs ${ID} properties ${NAME} update ${payload}`);
  });

  it('should make correct request for \'thngs $id properties $key delete\'', async () => {
    mockApi()
      .delete(`/thngs/${ID}/properties/${NAME}`)
      .reply(200, {});

    await cli(`thngs ${ID} properties ${NAME} delete`);
  });

  // Thng actions
  it('should make correct request for \'thngs $id actions create $payload\'', async () => {
    const payload = JSON.stringify({ type: NAME });
    mockApi()
      .post(`/thngs/${ID}/actions/all`, payload)
      .reply(201, {});

    await cli(`thngs ${ID} actions create ${payload}`);
  });

  it('should make correct request for \'thngs $id actions list\'', async () => {
    mockApi()
      .get(`/thngs/${ID}/actions/all?perPage=30`)
      .reply(200, {});

    await cli(`thngs ${ID} actions list`);
  });

  it('should make correct request for \'thngs $id actions $id read\'', async () => {
    mockApi()
      .get(`/thngs/${ID}/actions/all/${ID}`)
      .reply(200, {});

    await cli(`thngs ${ID} actions ${ID} read`);
  });

  // Thng commissions actions
  it('should make correct request for \'thngs $identifier actions commissions create $payload\'', async () => {
    const identifier = 'gs1:01:43876';
    const payload = JSON.stringify({});
    mockApi()
      .post(`/thngs/${identifier}/actions/commissions`, payload)
      .reply(201);

    await cli(`thngs ${identifier} actions commissions create ${payload}`);
  });

  it('should make correct request for \'thngs $identifier actions decommissions create $payload\'', async () => {
    const identifier = 'gs1:01:43876';
    const payload = JSON.stringify({});
    mockApi()
      .post(`/thngs/${identifier}/actions/decommissions`, payload)
      .reply(201);

    await cli(`thngs ${identifier} actions decommissions create ${payload}`);
  });

  it('should make correct request for \'thngs $identifier commission-state read\'', async () => {
    const identifier = 'gs1:01:43876';
    mockApi()
      .get(`/thngs/${identifier}/commissionState?perPage=30`)
      .reply(200);

    await cli(`thngs ${identifier} commission-state read`);
  });

  // Thng redirection
  it('should make correct request for \'thngs $id redirections $shortDomain create $payload\'',
    async () => {
      const payload = JSON.stringify({
        defaultRedirectUrl: 'https://google.com/{shortId}/',
        type: 'thng',
        evrythngId: ID,
      });
      nock('https://tn.gg')
        .post('/redirections', payload)
        .reply(201, {});

      await cli(`thngs ${ID} redirections tn.gg create ${payload}`);
    });

  it('should make correct request for \'thngs $id redirections $shortDomain list\'', async () => {
    nock('https://tn.gg')
      .get(`/redirections?evrythngId=${ID}`)
      .reply(200, [{}]);

    await cli(`thngs ${ID} redirections tn.gg list`);
  });

  it(
    'should make correct request for \'thngs $id redirections $shortDomain $shortId update $payload\'',
    async () => {
      const payload = JSON.stringify({ defaultRedirectUrl: 'https://google.com/{shortId}/updates/' });
      nock('https://tn.gg')
        .put('/redirections/foo', payload)
        .reply(200, {});

      await cli(`thngs ${ID} redirections tn.gg foo update ${payload}`);
    },
  );

  it('should make correct request for \'thngs $id redirections $shortDomain $shortId delete\'',
    async () => {
      nock('https://tn.gg')
        .delete('/redirections/foo')
        .reply(200);

      await cli(`thngs ${ID} redirections tn.gg foo delete`);
    });

  // Thng location
  it('should make correct request for \'thngs $id location read\'', async () => {
    mockApi()
      .get(`/thngs/${ID}/location?perPage=30`)
      .reply(200, {});

    await cli(`thngs ${ID} location read`);
  });

  it('should make correct request for \'thngs $id location update $payload\'', async () => {
    const payload = JSON.stringify([{
      position: { type: 'Point', coordinates: [-17.3, 36] },
    }]);
    mockApi()
      .put(`/thngs/${ID}/location`, payload)
      .reply(200, {});

    await cli(`thngs ${ID} location update ${payload}`);
  });

  it('should make correct request for \'thngs $id location delete\'', async () => {
    mockApi()
      .delete(`/thngs/${ID}/location`)
      .reply(200, {});

    await cli(`thngs ${ID} location delete`);
  });

  // Thng Device API Key
  it('should make correct request for \'thngs device-key create $payload\'', async () => {
    const payload = JSON.stringify({ thngId: ID });
    mockApi()
      .post('/auth/evrythng/thngs')
      .reply(201, {});

    await cli(`thngs device-key create ${payload}`);
  });

  it('should make correct request for \'thngs $id device-key read\'', async () => {
    mockApi()
      .get(`/auth/evrythng/thngs/${ID}`)
      .reply(200, {});

    await cli(`thngs ${ID} device-key read`);
  });

  it('should make correct request for \'thngs $id device-key delete\'', async () => {
    mockApi()
      .delete(`/auth/evrythng/thngs/${ID}`)
      .reply(200, {});

    await cli(`thngs ${ID} device-key delete`);
  });

  // Finally
  it('should make correct request for \'thngs $id delete\'', async () => {
    mockApi()
      .delete(`/thngs/${ID}`)
      .reply(200, {});

    await cli(`thngs ${ID} delete`);
  });

  // firstArg aliases
  it('should make correct request for \'t list\'', async () => {
    mockApi()
      .get('/thngs?perPage=30')
      .reply(200, {});

    await cli('t list');
  });

  // Verb aliases
  it('should make correct request for \'t c $payload\'', async () => {
    const payload = JSON.stringify({ name: 'test' });
    mockApi()
      .post('/thngs', payload)
      .reply(201, {});

    await cli(`t c ${payload}`);
  });

  it('should make correct request for \'t l \'', async () => {
    mockApi()
      .get('/thngs?perPage=30')
      .reply(200, []);

    await cli('t l');
  });

  it('should make correct request for \'t $id u $payload\'', async () => {
    const payload = JSON.stringify({ name: 'test' });
    mockApi()
      .put(`/thngs/${ID}`, payload)
      .reply(200, {});

    await cli(`t ${ID} u ${payload}`);
  });
});
