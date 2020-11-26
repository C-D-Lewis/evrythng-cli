/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { NAME, ID, mockApi } = require('../util');
const cli = require('../../src/functions/cli');

describe('actions', () => {
  it('should make correct request for \'actions $type create $payload\'', async () => {
    const payload = JSON.stringify({ type: NAME });
    mockApi()
      .post(`/actions/${NAME}`, payload)
      .reply(201, {});

    await cli(`actions ${NAME} create ${payload}`);
  });

  it('should make correct request for \'actions $type list\'', async () => {
    mockApi()
      .get(`/actions/${NAME}?perPage=30`)
      .reply(200, {});

    await cli(`actions ${NAME} list`);
  });

  it('should make correct request for \'actions $type $id read\'', async () => {
    mockApi()
      .get(`/actions/${NAME}/${ID}`)
      .reply(200, {});

    await cli(`actions ${NAME} ${ID} read`);
  });

  it('should make correct request for \'actions $type $id delete\'', async () => {
    mockApi()
      .delete(`/actions/${NAME}/${ID}`)
      .reply(200, {});

    await cli(`actions ${NAME} ${ID} delete`);
  });

  it('should make correct request for \'a $type list\'', async () => {
    mockApi()
      .get(`/actions/${NAME}?perPage=30`)
      .reply(200, {});

    await cli(`a ${NAME} list`);
  });
});
