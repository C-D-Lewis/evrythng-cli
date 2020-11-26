/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { ID, API_KEY, mockApi } = require('../util');
const cli = require('../../src/functions/cli');
const switches = require('../../src/modules/switches');

const ACTIVATION_CODE = '843nxnun';
const APP_USER = {
  firstName: 'test',
  lastName: 'user',
  email: 'test-user@test.com',
  password: 'password',
};

describe('app-users', () => {
  afterEach(() => {
    switches.API_KEY = false;
  });

  it('should make correct request for \'app-users create $payload\'', async () => {
    const payload = JSON.stringify(APP_USER);
    mockApi()
      .matchHeader('authorization', API_KEY)
      .post('/auth/evrythng/users', payload)
      .reply(201, {});

    await cli(`app-users create ${payload} --api-key ${API_KEY}`);
  });

  it('should make correct request for \'app-users $id validate $payload\'', async () => {
    const payload = JSON.stringify({ activationCode: ACTIVATION_CODE });
    mockApi()
      .matchHeader('authorization', API_KEY)
      .post(`/auth/evrythng/users/${ID}/validate`, payload)
      .reply(201, {});

    await cli(`app-users ${ID} validate ${payload} --api-key ${API_KEY}`);
  });

  it('should make correct request for \'app-users anonymous create\'', async () => {
    const payload = JSON.stringify({ anonymous: true });
    mockApi()
      .matchHeader('authorization', API_KEY)
      .post('/auth/evrythng/users?anonymous=true', payload)
      .reply(201, {});

    await cli(`app-users anonymous create --api-key ${API_KEY}`);
  });

  it('should make correct request for \'app-users list\'', async () => {
    mockApi()
      .get('/users?perPage=30')
      .reply(200, {});

    await cli('app-users list');
  });

  it('should make correct request for \'app-users $id read\'', async () => {
    mockApi()
      .get(`/users/${ID}`)
      .reply(200, {});

    await cli(`app-users ${ID} read`);
  });

  it('should make correct request for \'app-users $id update $payload\'', async () => {
    const payload = JSON.stringify({ firstName: 'Test '});
    mockApi()
      .put(`/users/${ID}`, payload)
      .reply(200, {});

    await cli(`app-users ${ID} update ${payload}`);
  });

  it('should make correct request for \'app-users login $payload\'', async () => {
    const payload = JSON.stringify({ email: APP_USER.email, password: APP_USER.password });
    mockApi()
      .matchHeader('authorization', API_KEY)
      .post('/users/login', payload)
      .reply(200, {});

    await cli(`app-users login ${payload} --api-key ${API_KEY}`);
  });

  it('should make correct request for \'app-users logout\'', async () => {
    mockApi()
      .matchHeader('authorization', API_KEY)
      .post('/auth/all/logout')
      .reply(200, {});

    await cli(`app-users logout --api-key ${API_KEY}`);
  });

  it('should make correct request for \'app-users $id delete\'', async () => {
    mockApi()
      .delete(`/users/${ID}`)
      .reply(200, {});

    await cli(`app-users ${ID} delete`);
  });

  it('should make correct request for \'au list\'', async () => {
    mockApi()
      .get('/users?perPage=30')
      .reply(200, {});

    await cli('app-users list');
  });
});
