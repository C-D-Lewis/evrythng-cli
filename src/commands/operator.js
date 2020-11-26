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

const getAvailableOperators = () => Object.keys(config.get('operators'));

const checkOperatorExists = (name) => {
  const items = getAvailableOperators();
  if (!items.includes(name)) {
    throw new Error(`\nOperator '${name}' not found in ${config.PATH}.`);
  }
};

const resolveKey = (name) => {
  checkOperatorExists(name);

  return config.get('operators')[name].apiKey;
};

/**
 * Switch the config to a new operator, by name.
 *
 * @param {string[]} args - Remaining launch arguments, including the operator name to use.
 */
const useOperator = (args) => {
  const [name] = args;

  checkOperatorExists(name);
  config.set('using', name);

  const { region } = config.get('operators')[name];
  logger.info(`\nSwitched to operator '${name}' in region '${region}'`);
};

const formatOperator = item => `'${item}' (Key: ${resolveKey(item).substring(0, 4)}...)`;

const list = () => {
  const operators = getAvailableOperators();
  if (!operators.length) {
    logger.error('No Operators available.');
    return { operators: [], using: '' };
  }

  const formatted = operators.map(formatOperator).join('\n- ');
  logger.info(`\nCurrent: '${config.get('using')}'\nAvailable:\n- ${formatted}\n`);
  return { operators, using: config.get('using') };
};

const showKey = ([name]) => {
  const key = resolveKey(name);

  logger.info(key);
  return key;
};

/**
 * Test an operator's credentials work, else throw.
 *
 * @param {string} region - User entered region.
 * @param {string} apiKey - User entered API key.
 */
const validateCredentials = async (region, apiKey) => {
  evrythng.setup({ apiUrl: REGIONS[region] });
  const access = await evrythng.api({ url: '/access', apiKey: apiKey });
  if (access.actor.type !== 'operator') {
    throw new Error('Actor was not operator');
  }
};

/**
 * Add an operator record to the configuration, if it is valid.
 *
 * @param {string[]} args - The command arguments provided.
 */
const addOperator = async (args) => {
  const [, name, region, apiKey] = args;
  if (!REGIONS[region]) {
    throw new Error(`$region must be one of ${Object.keys(REGIONS).join(', ')}`);
  }
  if (name.includes(' ')) {
    throw new Error('Short name must be a single word');
  }
  if (apiKey.length !== 80) {
    throw new Error('API key is an invalid length');
  }

  // Check the key is valid
  try {
    await module.exports.validateCredentials(region, apiKey);
  } catch (e) {
    throw new Error('Failed to add operator - check $apiKey and $region are correct and compatible.');
  }

  const operators = config.get('operators');
  operators[name] = { apiKey, region };
  config.set('operators', operators);
  logger.info(`\nAdded operator '${name}' in region '${region}'`);

  // Automatically use it (likely we want to work with it right now)
  useOperator([name]);

  return operators[name];
};

/**
 * Remove an operator by name. If it's the current one, unset `config.using`.
 *
 * @param {string[]} args - Remaining launch arguments, including the operator name to delete.
 */
const removeOperator = (args) => {
  const [name] = args;

  const operators = config.get('operators');
  delete operators[name];
  config.set('operators', operators);
  logger.info(`\nRemoved operator '${name}'`);

  if (config.get('using') === name) {
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
    logger.error(`Invalid operator: ${name}`);
    return undefined;
  }

  const { region } = config.get('operators')[name];
  return REGIONS[region];
};

const applyRegion = () => {
  const name = config.get('using');
  if (!name) {
    return;
  }

  const { region } = config.get('operators')[name];
  evrythng.setup({ apiUrl: REGIONS[region] });
};

/**
 * Present a first-launch experience to the user if no operators are found.
 */
const checkFirstRun = async () => {
  const operators = config.get('operators');
  if (Object.keys(operators).length) {
    return;
  }

  logger.info('\nWelcome to the EVRYTHNG CLI!\n\nTo get started, please provide the following '
    + 'to set up your first account Operator:\n');

  const name = await getValue('Short Operator name (e.g: \'personal\')');
  const region = await getValue('Account region (\'us\' or \'eu\')');
  const apiKey = await getValue('Operator API Key (from \'Account Settings\' in the EVRYTHNG Dashboard\')');
  await addOperator([null, name, region, apiKey]);

  logger.info('\n------------------------ Setup Complete ------------------------');
  logger.info('You\'re all set! Commands follow a \'resource type\' \'verb\' format.\n');
  logger.info('Some examples to get you started:');
  logger.info('  evrythng thngs list');
  logger.info('  evrythng thngs UnQ8nqfQeD8aQpwRanrXaaPt read');
  logger.info('  evrythng products create \'{"name": "My New Product"}\'\n');
  logger.info('Type \'evrythng\' to see all available commands and options. Enjoy!');
  process.exit();
};

const getCurrent = () => config.get('operators')[config.get('using')];


// ------------------------------------ API ------------------------------------

const getKey = () => {
  let override = switches.API_KEY;
  if (override) {
    const operators = config.get('operators');

    // API key or operator name?
    if (operators[override]) {
      // Apply operator as override
      const { apiKey, region } = operators[override];
      override = apiKey;
      evrythng.setup({ apiUrl: REGIONS[region] });
    } else if (override.length !== 80) {
      // It's not a valid API key either
      throw new Error('Invalid API key provided to --api-key');
    }
  }

  const operator = config.get('using');
  if (!operator) {
    throw new Error('No Operator has been selected yet. Use \'operators add\' to add one.');
  }

  return override || resolveKey(operator);
};

module.exports = {
  about: 'View and choose an Operator API Key for global use.',
  firstArg: ['operators', 'op'],
  operations: {
    add: {
      execute: addOperator,
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
      execute: useOperator,
      pattern: '$name use',
    },
    remove: {
      execute: removeOperator,
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
};
