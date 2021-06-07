/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const { ID, API_KEY, mockApi } = require('../util');
const cli = require('../../src/functions/cli');
const operator = require('../../src/commands/operator');
const switches = require('../../src/modules/switches');

const { expect } = chai;
chai.use(chaiAsPromised);

const CSV_PATH = './test.csv';
const JSON_PATH = './test.json';

describe('switches', () => {
  after(() => {
    fs.unlinkSync(CSV_PATH);
    fs.unlinkSync(JSON_PATH);
  });

  it('should accept the --filter switch', async () => {
    mockApi()
      .get('/thngs?filter=tags%3Dtest&perPage=30')
      .reply(200, []);

    await cli('thngs list --filter tags=test');
    switches.FILTER = false;
  });

  it('should accept the --with-scopes switch', async () => {
    mockApi()
      .get('/thngs?perPage=30&withScopes=true')
      .reply(200, []);

    await cli('thngs list --with-scopes');
    switches.SCOPES = false;
  });

  it('should accept the --per-page switch', async () => {
    mockApi()
      .get('/thngs?perPage=1')
      .reply(200, []);

    await cli('thngs list --per-page 1');
    switches.PER_PAGE = false;
  });

  it('should accept the --summary switch', async () => {
    mockApi()
      .get('/thngs?perPage=30')
      .reply(200, []);

    await cli('thngs list --summary');
    switches.SUMMARY = false;
  });

  it('should accept the --api-key switch', async () => {
    mockApi()
      .matchHeader('authorization', API_KEY)
      .get('/thngs?perPage=30')
      .reply(200, []);

    await cli(`thngs list --api-key ${API_KEY}`);
    switches.API_KEY = false;
  });

  it('should accept the --expand switch', async () => {
    mockApi()
      .get('/products?perPage=30')
      .reply(200, []);

    await cli('products list --expand');
    switches.EXPAND = false;
  });

  it('should accept the --field switch', async () => {
    mockApi()
      .get('/access?perPage=30')
      .reply(200, []);

    await cli('access read --field account');
    switches.FIELD = false;
  });

  it('should accept the --simple switch', async () => {
    mockApi()
      .get('/thngs?perPage=30')
      .reply(200, []);

    await cli('thngs list --simple');
    switches.SIMPLE = false;
  });

  it('should accept the --project switch', async () => {
    mockApi()
      .get(`/thngs?perPage=30&project=${ID}`)
      .reply(200, []);

    await cli(`thngs list --project ${ID}`);
    switches.PROJECT = false;
  });

  it('should accept the --page switch', async () => {
    mockApi()
      .get('/thngs?perPage=30')
      .reply(200, []);

    await cli('thngs list --page 1');
    switches.PAGE = false;
  });

  it('should accept the --context switch', async () => {
    mockApi()
      .get('/actions/scans?perPage=30&context=true')
      .reply(200, []);

    await cli('actions scans list --context');
    switches.CONTEXT = false;
  });

  it('should reject if --to-page is used without --to-csv', async () => {
    const list = cli('thngs list --to-page 2');
    return expect(list).to.eventually.be.rejected;
  });

  it('should accept the --to-page switch with --to-csv', async () => {
    mockApi()
      .get('/thngs?perPage=30')
      .reply(200, []);
    
    await cli(`thngs list --to-page 2 --to-csv ${CSV_PATH}`);
    switches.TO_PAGE = false;
    switches.TO_CSV = false;
  });

  it('should accept the --ids switch', async () => {
    mockApi()
      .get('/thngs?perPage=30&ids=UMa5MAFANhYGgwaaaGcqqh6c%2CU5Qs7YPEXEsWshaaaFM8egnh')
      .reply(200, []);

    await cli('thngs list --ids UMa5MAFANhYGgwaaaGcqqh6c,U5Qs7YPEXEsWshaaaFM8egnh');
    switches.IDS = false;
  });

  it('should accept the --build switch');

  it('should accept the --to-csv switch', async () => {
    mockApi()
      .persist()
      .get('/thngs?perPage=30')
      .reply(200, []);

    await cli(`thngs list --to-csv ${CSV_PATH}`);
    switches.TO_CSV = '';
  });

  it('should accept the --from-csv switch');

  it('should accept the --redirections switch');

  it('should accept the --to-json switch', async () => {
    mockApi()
      .persist()
      .get('/thngs?perPage=30')
      .reply(200, []);

    await cli(`thngs list --to-json ${JSON_PATH}`);
    switches.TO_JSON = '';
  });
});