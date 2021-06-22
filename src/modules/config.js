/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { validate } = require('jsonschema');
const fs = require('fs');

/** Default configuration file if none exists */
const DEFAULT_CONFIG = {
  using: '',
  keys: {},
  options: {
    errorDetail: false,
    noConfirm: true,
    showHttp: false,
    logLevel: 'info',
  },
  regions: {
    us: 'https://api.evrythng.com',
    eu: 'https://api-eu.evrythng.com',
    'us-v2': 'https://api.evrythng.io/v2',
    'eu-v2': 'https://api.eu.evrythng.io/v2',
  },
};

/** Config schema */
const CONFIG_SCHEMA = {
  required: ['using', 'options', 'regions'],
  properties: {
    using: { type: 'string' },
    keys: {
      patternProperties: {
        '(.*)': {
          additionalProperties: false,
          required: ['apiKey', 'region'],
          properties: {
            apiKey: {
              type: 'string',
              minLength: 80,
              maxLength: 80,
            },
            region: { type: 'string' },
          },
        },
      },
    },
    options: {
      additionalProperties: false,
      required: ['errorDetail', 'noConfirm', 'showHttp', 'logLevel', 'defaultPerPage'],
      properties: {
        errorDetail: { type: 'boolean' },
        noConfirm: { type: 'boolean' },
        showHttp: { type: 'boolean' },
        logLevel: {
          type: 'string',
          enum: ['info', 'error'],
        },
        defaultPerPage: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
        },
      },
    },
    regions: { type: 'object' },
  },
};

/** Default perPage value to apply */
const DEFAULT_DEFAULT_PER_PAGE = 30;

/** Config file path */
const CONFIG_PATH = `${require('os').homedir()}/.evrythng-cli-config`;

let data;

/**
 * Validate the config.
 *
 * @param {object} input - Config object to validate.
 */
const validateConfig = (input) => {
  const results = validate(input, CONFIG_SCHEMA);
  if (results.errors && results.errors.length) {
    throw new Error(`\nConfiguration is invalid:\n- ${results.errors.map(item => item.stack).join('\n- ')}`);
  }
};

/**
 * Write the config to file.
 */
const write = () => fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');

/**
 * Migrate aspects of the config between versions.
 *
 * @param {object} input - Config to migrate.
 */
const migrateConfig = (input) => {
  // v1.1.0 - new defaultPerPage option
  if (!input.options.defaultPerPage) {
    input.options.defaultPerPage = DEFAULT_DEFAULT_PER_PAGE;
  }

  // 1.14.0 - operators renamed to keys
  if (input.operators) {
    input.keys = input.operators;
    delete input.operators;
  }

  write();
};

/**
 * Load config from file.
 */
const load = () => {
  if (!fs.existsSync(CONFIG_PATH)) {
    data = DEFAULT_CONFIG;
    write();
    return;
  }

  data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  migrateConfig(data);
  validateConfig(data);
};

/**
 * Get data from the config.
 *
 * @param {string} key - Name of item to get.
 * @returns {*} Data if it exists.
 */
const get = key => data[key];

/**
 * Set data to the config.
 *
 * @param {string} key - Name of item to get.
 * @param {*} value - Data to store.
 */
const set = (key, value) => {
  data[key] = value;
  write();
};

module.exports = {
  CONFIG_PATH,
  get,
  set,
  validateConfig,
};

load();
