/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const evrythng = require('evrythng');
const fs = require('fs');
const semverCompare = require('semver-compare');
const { validate } = require('./util');
const commands = require('./commands');
const config = require('./config');
const operator = require('../commands/operator');
const switches = require('./switches');
const { version } = require('../../package.json');

const COMMAND_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  requried: ['about', 'firstArg', 'operations'],
  properties: {
    about: { type: 'string' },
    firstArg: { type: 'string' },
    operations: {
      type: 'object',
      patternProperties: {
        '[.*?]*': {
          type: 'object',
          additionalProperties: false,
          requried: ['pattern', 'execute'],
          properties: {
            execute: { type: 'any' },
            pattern: { type: 'string' },
            helpPattern: { type: 'string' },
          },
        },
      },
    },
  },
};

// Read node_modules alongside CLI
const NODE_MODULES_PATH = `${__dirname}/../../../`;
const PREFIX = 'evrythng-cli-plugin-';

/** API object passed to plugins as they are loading. */
const API = {
  /** Current CLI version loading the plugin */
  version,

  /**
   * Register a new command (must satisfy COMMAND_SCHEMA)
   *
   * @param {object} command - The command to add.
   */
  registerCommand: (command) => {
    const errors = validate(command, COMMAND_SCHEMA);
    if (errors.length) {
      throw new Error(`Invalid command object: ${JSON.stringify(errors)}`);
    }

    command.fromPlugin = true;
    commands.COMMAND_LIST.push(command);
  },

  /**
   * Get the config.options object.
   *
   * @returns {object} config.options.
   */
  getOptions: () => config.get('options'),

  /**
   * Get an object of active switches, and their values.
   *
   * @returns {object} Object of active switches and their values.
   */
  getSwitches: () => switches.active,

  /**
   * Get the config interface, including the get() and set() methods.
   *
   * @returns {object} config object.
   */
  getConfig: () => config,

  /**
   * Run an existing CLI command, as a list of tokens.
   *
   * @param {string[]} args - The args to identify and run.
   * @returns {Promise<object>} The command result, such as API response data.
   */
  runCommand: async (args) => {
    const command = commands.identify(args);
    if (!command) {
      throw new Error(`Command '${args.join(' ')}' was not recognised.`);
    }

    operator.applyRegion();
    const res = await command.execute(args.slice(1));
    if (!res) {
      return;
    }

    // Pass the data back for convenience, not the full fetch() response object
    return res.data ? res.data : res;
  },

  /**
   * Require a specific minimum CLI version to run.
   *
   * @params {string} Semver version to require, e.g: '1.7.0'.
   * @throws If the version required is less than the current running CLI version.
   */
  requireVersion: (spec) => {
    if (semverCompare(version, spec) < 0) {
      throw new Error(`This plugin requires evrythng-cli version ${spec} or above. You are using version ${version}.`);
    }
  },

  /**
   * Convenience method to get the current Operator as an SDK scope.
   * The region is automatically applied.
   *
   * @returns {object} Operator scope for the currently selected operator.
   */
  getCurrentOperator: async () => {
    const { apiKey } = operator.getCurrent();
    operator.applyRegion();
    const op = new evrythng.Operator(apiKey);
    await op.init();
    return op;
  },
};

const loadPlugin = (moduleName) => {
  try {
    require(`${NODE_MODULES_PATH}/${moduleName}`)(API);
  } catch (e) {
    throw new Error(`Failed to load plugin: ${moduleName} (${e.stack})`);
  }
};

const loadPlugins = () => {
  fs.readdirSync(NODE_MODULES_PATH)
    .filter(item => item.startsWith(PREFIX))
    .forEach(loadPlugin);
};

module.exports = {
  API,
  loadPlugins,
};
