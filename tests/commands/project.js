/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const fs = require('fs');
const { ID, mockApi } = require('../util');
const cli = require('../../src/functions/cli');

describe('projects', () => {
  // Project CRUD
  it('should make correct request for \'projects create $payload\'', async () => {
    const payload = JSON.stringify({ name: 'Test project' });
    mockApi()
      .post('/projects', payload)
      .reply(201, {});

    await cli(`projects create ${payload}`);
  });

  it('should make correct request for \'projects list\'', async () => {
    mockApi()
      .get('/projects?perPage=30')
      .reply(200, {});

    await cli('projects list');
  });

  it('should make correct request for \'projects $id read\'', async () => {
    mockApi()
      .get(`/projects/${ID}`)
      .reply(200, {});

    await cli(`projects ${ID} read`);
  });

  it('should make correct request for \'projects $id update $payload\'', async () => {
    const payload = JSON.stringify({ tags: ['test'] });
    mockApi()
      .put(`/projects/${ID}`, payload)
      .reply(200, {});

    await cli(`projects ${ID} update ${payload}`);
  });

  // Applications CRUD
  it('should make correct request for \'projects $id applications create $payload\'', async () => {
    const payload = JSON.stringify({ name: 'Test application', socialNetworks: {} });
    mockApi()
      .post(`/projects/${ID}/applications`, payload)
      .reply(201, {});

    await cli(`projects ${ID} applications create ${payload}`);
  });

  it('should make correct request for \'projects $id applications list\'', async () => {
    mockApi()
      .get(`/projects/${ID}/applications?perPage=30`)
      .reply(200, {});

    await cli(`projects ${ID} applications list`);
  });

  it('should make correct request for \'projects $id applications $id read\'', async () => {
    mockApi()
      .get(`/projects/${ID}/applications/${ID}`)
      .reply(200, {});

    await cli(`projects ${ID} applications ${ID} read`);
  });

  it('should make correct request for \'projects $id applications $id update $payload\'',
    async () => {
      const payload = JSON.stringify({ description: 'Updated application' });
      mockApi()
        .put(`/projects/${ID}/applications/${ID}`, payload)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} update ${payload}`);
    });

  // Trusted API Key
  it('should make correct request for \'projects $id applications $id secret-key read\'',
    async () => {
      mockApi()
        .get(`/projects/${ID}/applications/${ID}/secretKey?perPage=30`)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} secret-key read`);
    });

  // Application Redirector
  it('should make correct request for \'projects $id applications $id redirector read\'',
    async () => {
      mockApi()
        .get(`/projects/${ID}/applications/${ID}/redirector?perPage=30`,)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} redirector read`);
    });

  it('should make correct request for \'projects $id applications $id redirector update $payload\'',
    async () => {
      const payload = JSON.stringify({
        rules: [{ match: 'thng.name=test', redirectUrl: 'https://evrythng.com' }],
      });
      mockApi()
        .put(`/projects/${ID}/applications/${ID}/redirector`, payload)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} redirector update ${payload}`);
    });

  // Application Reactor
  it('should make correct request for \'projects $id applications $id reactor script read\'',
    async () => {
      mockApi()
        .get(`/projects/${ID}/applications/${ID}/reactor/script?perPage=30`)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor script read`);
    });

  it('should make correct request for \'projects $id applications $id reactor script update $payload\'',
    async () => {
      const script = 'function onActionCreated(event) {\n logger.debug(\'Hello World!\');\n done();}';
      const payload = JSON.stringify({ script });
      mockApi()
        .put(`/projects/${ID}/applications/${ID}/reactor/script`, payload)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor script update ${payload}`);
    });

  it(
    'should make correct request for \'projects $id applications $id reactor script upload $scriptPath $manifestPath\'',
    async () => {
      const scriptPath = `${__dirname}/../testScript.js`;
      const manifestPath = `${__dirname}/../testManifest.json`;
      const script = fs.readFileSync(scriptPath, 'utf8');
      const manifest = fs.readFileSync(manifestPath, 'utf8');
      const payload = { script, manifest };
      mockApi()
        .put(`/projects/${ID}/applications/${ID}/reactor/script`, payload)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor script upload ${scriptPath} ${manifestPath}`);
    });

  it('should make correct request for \'projects $id applications $id reactor script status read\'',
    async () => {
      mockApi()
        .get(`/projects/${ID}/applications/${ID}/reactor/script/status?perPage=30`)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor script status read`);
    });

  it('should make correct request for \'projects $id applications $id reactor logs read\'',
    async () => {
      mockApi()
        .get(`/projects/${ID}/applications/${ID}/reactor/logs?perPage=30`)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor logs read`);
    });

  it('should make correct request for \'projects $id applications $id reactor logs delete\'',
    async () => {
      mockApi()
        .delete(`/projects/${ID}/applications/${ID}/reactor/logs`)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor logs delete`);
    });

  it('should make correct request for \'projects $id applications $id reactor schedules create $payload\'',
    async () => {
      const payload = JSON.stringify({ event: {}, executeAt: Date.now() + 60000 });
      mockApi()
        .post(`/projects/${ID}/applications/${ID}/reactor/schedules`, payload)
        .reply(201, {});

      await cli(`projects ${ID} applications ${ID} reactor schedules create ${payload}`);
    });

  it('should make correct request for \'projects $id applications $id reactor schedules list\'',
    async () => {
      mockApi()
        .get(`/projects/${ID}/applications/${ID}/reactor/schedules?perPage=30`)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor schedules list`);
    });

  it('should make correct request for \'projects $id applications $id reactor schedules $id read\'',
    async () => {
      mockApi()
        .get(`/projects/${ID}/applications/${ID}/reactor/schedules/${ID}`)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor schedules ${ID} read`);
    });

  it('should make correct request for \'projects $id applications $id reactor schedules $id update $payload\'',
    async () => {
      const payload = JSON.stringify({ description: 'Updated schedule' });
      mockApi()
        .put(`/projects/${ID}/applications/${ID}/reactor/schedules/${ID}`, payload)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor schedules ${ID} update ${payload}`);
    });

  it('should make correct request for \'projects $id applications $id reactor schedules $id delete\'',
    async () => {
      mockApi()
        .delete(`/projects/${ID}/applications/${ID}/reactor/schedules/${ID}`)
        .reply(200, {});

      await cli(`projects ${ID} applications ${ID} reactor schedules ${ID} delete`);
    });

  // Finally
  it('should make correct request for \'projects $id applications $id delete\'', async () => {
    mockApi()
      .delete(`/projects/${ID}/applications/${ID}`)
      .reply(200, {});

    await cli(`projects ${ID} applications ${ID} delete`);
  });

  it('should make correct request for \'projects $id delete\'', async () => {
    mockApi()
      .delete(`/projects/${ID}`)
      .reply(200, {});

    await cli(`projects ${ID} delete`);
  });

  it('should make correct request for \'prj list\'', async () => {
    mockApi()
      .get('/projects?perPage=30')
      .reply(200, {});

    await cli('prj list');
  });
});
