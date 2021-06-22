/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const evrythng = require('evrythng');
const { getValue } = require('../modules/prompt');
const config = require('../modules/config');
const logger = require('../modules/logger');
const switches = require('../modules/switches');

const REGIONS = config.get('regions');

/**
 * Get available keys from the config.
 *
 * @returns {Array<string>} Array of key names available.
 */
const getAvailableKeys = () => Object.keys(config.get('keys'));

/**
 * Check a key is in the config.
 *
 * @param {string} name - Name of the key.
 */
const ensureKeyExists = (name) => {
  const keys = getAvailableKeys();
  if (!keys.includes(name)) throw new Error(`\nKey '${name}' not found in ${config.CONFIG_PATH}.`);
};

/**
 * Resolve key from name.
 *
 * @param {string} name - Name of the key.
 * @returns {string} The key's API key.
 */
const resolveKey = (name) => {
  ensureKeyExists(name);

  return config.get('keys')[name].apiKey;
};

/**
 * Switch the CLI to a new key, by name.
 *
 * @param {Array<string>} args - Remaining launch arguments, including the key name to use.
 */
const useKey = ([name]) => {
  ensureKeyExists(name);
  config.set('using', name);

  const { region } = config.get('keys')[name];
  logger.info(`\nSwitched to key '${name}' in region '${region}'`);
};

/**
 * Format a key for display.
 */
const formatKey = item => `'${item}' (API key: ${resolveKey(item).substring(0, 4)}...)`;

/**
 * List all known keys. Returned for tests.
 */
const list = () => {
  const keys = getAvailableKeys();
  if (!keys.length) {
    logger.error('No keys have been stored.');
    return { keys: [], using: '' };
  }

  const formatted = keys.map(formatKey).join('\n- ');
  logger.info(`\nCurrent: '${config.get('using')}'\nAvailable:\n- ${formatted}\n`);
  return { keys, using: config.get('using') };
};

/**
 * Print a key. Useful for bash scripts.
 *
 * @param {Array<string>} args - Program args.
 */
const showKey = ([name]) => {
  const apiKey = resolveKey(name);
  logger.info(apiKey);

  return apiKey;
};

/**
 * Test a key works in the region, else throw.
 *
 * @param {string} region - User entered region.
 * @param {string} apiKey - User entered API key.
 */
const validateCredentials = async (region, apiKey) => {
  evrythng.setup({ apiUrl: REGIONS[region] });
  await evrythng.api({ url: '/access', apiKey });
};

/**
 * Add a key record to the configuration, if it is valid.
 *
 * @param {Array<string>} args - The command arguments provided.
 */
const addKey = async (args) => {
  const [, name, region, apiKey] = args;
  if (!REGIONS[region]) throw new Error(`$region must be one of ${Object.keys(REGIONS).join(', ')}`);
  if (name.includes(' ')) throw new Error('Short name must be a single word');
  if (apiKey.length !== 80) throw new Error('API key is an invalid length');

  // Check the key is valid
  try {
    await module.exports.validateCredentials(region, apiKey);
  } catch (e) {
    console.log(e)
    throw new Error('Failed to add key - check $apiKey and $region are correct and compatible.');
  }

  const keys = config.get('keys');
  keys[name] = { apiKey, region };
  config.set('keys', keys);
  logger.info(`\nAdded key '${name}' in region '${region}'`);

  // Automatically use it (likely we want to work with it right now)
  useKey([name]);
  return keys[name];
};

/**
 * Remove a key by name. If it's the current one, unset `config.using`.
 *
 * @param {string[]} args - Remaining launch arguments, including the key name to delete.
 */
const removeKey = ([name]) => {
  const keys = config.get('keys');
  delete keys[name];
  config.set('keys', keys);
  logger.info(`\nRemoved key '${name}'`);

  if (config.get('using') === name) {
    console.log('Key was in use, please choose another.');
    config.set('using', '');
  }
};

/**
 * Get the current region URL
 *
 * @returns {string} The current region URL.
 */
const getRegionUrl = () => {
  const name = config.get('using');
  if (!name) {
    logger.error(`Invalid key: ${name}`);
    return undefined;
  }

  const { region } = config.get('keys')[name];
  return REGIONS[region];
};

/**
 * Apply region URL.
 */
const applyRegion = () => {
  const name = config.get('using');
  if (!name) return;

  const { region } = config.get('keys')[name];
  evrythng.setup({ apiUrl: REGIONS[region] });
};

/**
 * Present a first-launch experience to the user if no keys are found.
 */
const checkFirstRun = async () => {
  const keys = config.get('keys');
  if (Object.keys(keys).length) return;

  logger.info('\nWelcome to the EVRYTHNG CLI!\n\nTo get started, please provide the following '
    + 'to store your first API key:\n');

  const name = await getValue('Short key name (e.g: \'personal\')');
  const region = await getValue('Account region (\'us\' or \'eu\')');
  const apiKey = await getValue('API Key (i.e: Operator API Key or Access Token)');
  await addKey([null, name, region, apiKey]);

  logger.info('\n------------------------ Setup Complete ------------------------');
  logger.info('You\'re all set! Commands follow a \'resource type\' \'verb\' format.\n');
  logger.info('Some examples to get you started:');
  logger.info('  evrythng thngs list');
  logger.info('  evrythng thngs UnQ8nqfQeD8aQpwRanrXaaPt read');
  logger.info('  evrythng products create \'{"name": "My New Product"}\'\n');
  logger.info('Type \'evrythng\' to see all available commands and options. Enjoy!');
  process.exit();
};

/**
 * Get current key object in the config.
 *
 * @returns {object} Key object { apiKey, region }
 */
const getCurrent = () => config.get('keys')[config.get('using')];

/**
 * Attempt to construct an evrythng.js SDK scope using a key.
 *
 * @param {string} apiKey - API key to use, could be Operator API Key or Access Token.
 * @returns {Promise<object>} SDK scope.
 */
const getSdkScope = async (apiKey) => {
  let scope;
  try {
    scope = new evrythng.Operator(apiKey);
    await scope.init();
    return scope;
  } catch (e) {
    // Try Access Token
    try {
      scope = new evrythng.AccessToken(apiKey);
      await scope.init();
      return scope;
    } catch (e1) {
      console.log(e1);
      console.log(`Failed to create SDK scope from key ${apiKey} - it should be an Operator or Access Token`);

      throw e1;
    }
  }
};

/**
 * Get the key to use for this invocation. Overridden with --api-key, or the current key.
 *
 * @returns {string} API key chosen.
 */
const getKey = () => {
  let override = switches.API_KEY;
  if (override) {
    // API key or operator name?
    const keys = config.get('keys');
    if (keys[override]) {
      // Apply key as override
      const { apiKey, region } = keys[override];
      override = apiKey;
      evrythng.setup({ apiUrl: REGIONS[region] });
      return override;
    }

    // It's not a valid API key, can't use value
    if (override.length !== 80) throw new Error('Invalid API key provided to --api-key');
  }

  // Use currently selected key
  const keyName = config.get('using');
  if (!keyName) throw new Error('No key has been selected. Use \'keys add\' to add one.');

  // Unknown override, or from 'using' key name
  return override || resolveKey(keyName);
};

module.exports = {
  about: 'View and choose a stored API Key for global use.',
  firstArg: ['keys'],
  operations: {
    add: {
      execute: addKey,
      pattern: 'add $name $region $apiKey',
    },
    list: {
      execute: list,
      pattern: 'list',
    },
    read: {
      execute: showKey,
      pattern: '$name read',
    },
    use: {
      execute: useKey,
      pattern: '$name use',
    },
    remove: {
      execute: removeKey,
      pattern: '$name remove',
    },
  },
  getKey,
  getRegionUrl,
  applyRegion,
  checkFirstRun,
  resolveKey,
  getCurrent,
  validateCredentials,
  getSdkScope,
};
