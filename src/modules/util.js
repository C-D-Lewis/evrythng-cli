/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { omit } = require('lodash');
const jsonschema = require('jsonschema');
const evrythng = require('evrythng');
const fs = require('fs');
const indent = require('../functions/indent');
const logger = require('./logger');
const key = require('../commands/key');
const payloadBuilder = require('./payloadBuilder');
const switches = require('./switches');

const INDENT_SIZE = 2;

/* Keys that are read-only */
const READ_ONLY_KEYS = [
  'id',
  'createdAt',
  'updatedAt',
  'activatedAt',
  'batch',
  'createdByTask',
  'fn',
  'scopes',
];

/** Resource types that may have a redirection set. */
const REDIRECTABLE = [
  'thng',
  'product',
];

// TODO: Redirector, Reactor schedules, etc...
const SPECIAL_BUILDERS = {
  task: payloadBuilder.task,
};

const isId = input => input.length === 24;

const pretty = obj => JSON.stringify(obj, null, 2);

const printListSummary = (list) => {
  list.forEach(item => logger.info(`- ${item.id} '${item.name}'`));
};

const printSimple = (obj, level) => {
  Object.keys(obj).forEach((item) => {
    const value = obj[item];
    if (typeof value === 'object' && !(typeof value === 'string')) {
      logger.info(indent(`${item}:`, level, INDENT_SIZE));

      if (Array.isArray(value)) {
        if (typeof value[0] === 'string') {
          value.forEach(item2 => logger.info(indent(item2, level + 1, INDENT_SIZE)));
          return;
        }

        value.forEach(item2 => printSimple(item2, level + 1));
        return;
      }

      printSimple(value, level + 1);
      return;
    }

    logger.info(indent(`${item}: ${value}`, level, INDENT_SIZE));
  });
};

const getPayload = async (defName, jsonStr) => {
  if (switches.BUILD) {
    // Special builders, such as tasks
    if (SPECIAL_BUILDERS[defName]) {
      return SPECIAL_BUILDERS[defName]();
    }

    return payloadBuilder.resource(defName);
  }

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Invalid or missing JSON payload');
  }
};

const requireKey = (name) => {
  if (!switches.API_KEY) {
    throw new Error(`Requires --api-key switch specifying the ${name} API Key.`);
  }
};

const validate = (instance, schema) => {
  const { errors } = jsonschema.validate(instance, schema);
  if (!errors || errors.length === 0) {
    return [];
  }

  return errors.map(item => item.stack);
};

/**
 * Sequentially run a series of functions that return Promises.
 *
 * @param {Function[]} items - Array of functions that return Promises.
 * @returns {Promise} A Promise that resolves when all items have been processed.
 */
const nextTask = async (items) => {
  if (!items.length) return;

  return items.splice(0, 1)[0]().then(() => nextTask(items));
};

/**
 * Create request options for creating a resource redirection.
 *
 * @param {object} scope - The actor scope.
 * @param {string} evrythngId - The resource ID.
 * @param {string} type - The resource type.
 * @param {string} defaultRedirectUrl - The redirection URL.
 * @returns {object} The complete request options for evrythng.api().
 */
const createRedirectionOptions = (scope, evrythngId, type, defaultRedirectUrl) => ({
  apiUrl: `https://${switches.WITH_REDIRECTIONS}`,
  url: '/redirections',
  method: 'post',
  apiKey: scope.apiKey,
  headers: { Accept: 'application/json' },
  data: { evrythngId, defaultRedirectUrl, type },
});

/**
 * Create a redirection for a resource. The URL must include a suitable placeholder.
 *
 * @param {object} scope - The SDK scope making the request.
 * @param {string} evrythngId - The resource ID.
 * @param {string} type - The resource type.
 * @param {string} defaultRedirectUrl - The redirection URL.
 */
const createRedirection = async (scope, evrythngId, type, defaultRedirectUrl) => {
  try {
    if (!REDIRECTABLE.includes(type)) {
      throw new Error(`'${type}' resources cannot have a redirection set.`);
    }

    const options = createRedirectionOptions(scope, evrythngId, type, defaultRedirectUrl);
    const res = await evrythng.api(options);
    logger.info(`  Created redirection: ${res.defaultRedirectUrl}`);
  } catch (e) {
    logger.error(`Error: ${e.errors ? e.errors[0] : e.message}`);
  }
};

/**
 * Create a single resource from a data object.
 *
 * @param {object} scope - evrythng.js scope.
 * @param {object} resource - The object to create as a resource.
 * @param {string} type - The resource type, as evrythng.js scope member name.
 */
const createResource = async (scope, resource, type) => {
  const params = {};
  const projectId = switches.PROJECT;
  if (projectId) {
    params.project = projectId;
  }

  try {
    const res = await scope[type]().create(resource, { params });
    logger.info(`Created ${type} ${res.id}`);
    return res;
  } catch (e) {
    if (e.errors) {
      // Report a data-specific error
      logger.error(`Error: ${e.errors[0]}`);
      return;
    }

    // Throw a syntax error
    throw e;
  }
};

/**
 * Read a file, of any type. Path is validated before opportunities for reading items
 * and transforming each as required.
 *
 * @param {string} type - The resource type.
 * @param {string} path - The file path, which is validated.
 * @param {function} getItems - Function given 'path' that gets the items.
 * @param {function} transform - Optional, transform each item.
 */
const readFile = async (type, path, getItems, transform) => {
  if (!fs.existsSync(path)) {
    throw new Error('File was not found!');
  }

  const items = await getItems(path);
  const scope = await key.getSdkScope(key.getKey());
  await nextTask(items.map(item => async () => {
    let payload = omit(item, ['redirection'].concat(READ_ONLY_KEYS));
    if (transform) {
      payload = transform(payload);
    }

    const res = await createResource(scope, payload, type);

    // Create the redirection, if required
    if (item.redirection && switches.WITH_REDIRECTIONS) {
      await createRedirection(scope, res.id, type, item.redirection);
    }
  }));
};

/**
 * Read any available redirections for the list of resources.
 *
 * @param {Array} items - Array of objects to find redirections for.
 * @param {string} shortDomain - The short domain to find those redirections, such as 'tn.gg'.
 */
const readRedirections = async (items, shortDomain) => {
  const tasks = items.map(item => async () => {
    try {
      const [redirection] = await evrythng.api({
        apiUrl: `https://${shortDomain}`,
        url: `/redirections?evrythngId=${item.id}`,
        apiKey: key.getKey(),
      });

      if (redirection) {
        item.redirection = redirection.defaultRedirectUrl;
      }
    } catch (e) {
      // Type can have no redirection
      if (e.errors && e.errors[0].includes('requested resource')) {
        throw new Error('This resource type does not support redirections.');
      }

      logger.error(e.errors ? e.errors[0] : e.message);
    }
  });
  return nextTask(tasks);
};

/**
 * Modify items to include a 'redirection', if required.
 *
 * @param {Array} items - The array of items to check.
 */
const addResourceRedirections = async (items) => {
  const shortDomain = switches.WITH_REDIRECTIONS;
  if (shortDomain) {
    logger.info(`Reading ${items.length} redirections...`);
    await readRedirections(items, shortDomain);
  }
};

module.exports = {
  READ_ONLY_KEYS,
  isId,
  pretty,
  getPayload,
  printListSummary,
  printSimple,
  requireKey,
  validate,
  nextTask,
  createRedirection,
  createRedirectionOptions,
  createResource,
  readFile,
  addResourceRedirections,
};
