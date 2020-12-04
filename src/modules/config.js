/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { validate } = require('jsonschema');
const fs = require('fs');

/** Default configuration file if none exists */
const DEFAULT_CONFIG = {
  using: '',
  operators: {},
  options: {
    errorDetail: false,
    noConfirm: true,
    showHttp: false,
    logLevel: 'info',
  },
  regions: {
    us: 'https://api.evrythng.com',
    eu: 'https://api-eu.evrythng.com',
    'enterprise-us': 'https://api.evrythng.io/v2',
    'enterprise-eu': 'https://api.eu.evrythng.io/v2',
  },
};

const CONFIG_SCHEMA = {
  additionalProperties: false,
  required: ['using', 'operators', 'options', 'regions'],
  properties: {
    using: { type: 'string' },
    operators: {
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

const DEFAULT_DEFAULT_PER_PAGE = 30;

const PATH = `${require('os').homedir()}/.evrythng-cli-config`;

let data;

const validateConfig = (input) => {
  const results = validate(input, CONFIG_SCHEMA);
  if (results.errors && results.errors.length) {
    throw new Error(`\nConfiguration is invalid:\n- ${results.errors.map(item => item.stack).join('\n- ')}`);
  }
};

const write = () => fs.writeFileSync(PATH, JSON.stringify(data, null, 2), 'utf8');

const migrateConfig = (input) => {
  // v1.1.0 - new defaultPerPage option
  if (!input.options.defaultPerPage) {
    input.options.defaultPerPage = DEFAULT_DEFAULT_PER_PAGE;
  }

  write();
};

const load = () => {
  if (!fs.existsSync(PATH)) {
    data = DEFAULT_CONFIG;
    write();
    return;
  }

  data = JSON.parse(fs.readFileSync(PATH, 'utf8'));
  migrateConfig(data);
  validateConfig(data);
};

const get = key => data[key];

const set = (key, value) => {
  data[key] = value;
  write();
};

module.exports = {
  PATH,
  get,
  set,
  validateConfig,
};

load();
