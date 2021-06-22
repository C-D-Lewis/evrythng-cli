const nock = require('nock');
const config = require('../src/modules/config');
const cli = require('../src/functions/cli');
const switches = require('../src/modules/switches');

const ctx = {};

/** Fake ID */
const ID = '012345678901234567890123';

/** Fake API key */
const API_KEY = '01234567890123456789012345678901234567890123456789012345678901234567890123456789';

/** Fake name for action types, property keys, etc. */
const NAME = 'scans';

const waitAsync = async ms => new Promise(resolve => setTimeout(resolve, ms));

const createProject = async () => {
  const payload = JSON.stringify({ name: 'Test project' });
  const res = await cli(`projects create ${payload}`);

  return res.data;
};

const createApplication = async (projectId) => {
  const payload = JSON.stringify({ name: 'Test app', socialNetworks: {} });
  const res = await cli(`projects ${projectId} applications create ${payload}`);

  return res.data;
};

const createAppUser = async (name) => {
  let payload = JSON.stringify({
    firstName: 'test',
    lastName: 'user',
    email: `${name}@example.com`,
    password: 'password',
  });
  let res = await cli(`app-users create ${payload} --api-key ${ctx.application.appApiKey}`);
  switches.API_KEY = false;

  // Validate Application User
  payload = JSON.stringify({ activationCode: res.data.activationCode });
  const argStr = `app-users ${res.data.evrythngUser} validate ${payload} --api-key ${ctx.application.appApiKey}`;
  res = await cli(argStr);
  switches.API_KEY = false;
  return res.data;
};

/**
 * Prepare nock for an API request.
 *
 * @param {boolean} allowUnmocked - Allow nock to make unmocked requests to the API.
 * @returns {object} nock scope object.
 */
const mockApi = (allowUnmocked = false) => {
  const regions = config.get('regions');
  const { region } = config.get('keys')[config.get('using')];
  return nock(regions[region], { allowUnmocked });
};

module.exports = {
  ctx,
  waitAsync,
  createAppUser,
  createProject,
  createApplication,
  mockApi,
  ID,
  API_KEY,
  NAME,
};
