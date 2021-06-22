/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const evrythng = require('evrythng');
const evrythngSwagger = require('evrythng-swagger');
const jsonSchemaParser = require('json-schema-ref-parser');
const config = require('./config');
const indent = require('../functions/indent');
const logger = require('./logger');
const key = require('../commands/key');
const prompt = require('./prompt');


// ----------------------------------- Tasks -----------------------------------

const TASK_TYPES = ['POPULATING', 'SHORT_ID_GENERATION'];

const SHORT_ID_TEMPLATE_TYPES = ['SEQUENTIAL', 'PSEUDO_RANDOM'];
const SHORT_ID_PADDING_TYPES = ['ZERO', 'CHAR'];
const SHORT_ID_GENERATION_BASE = {
  type: 'SHORT_ID_GENERATION',
  inputParameters: {},
};
const SHORT_ID_TEMPLATE = { type: 'THNG_ID' };
const POPULATING_INPUT_TYPES = [
  'FIXED_AMOUNT', 'FILE_BASED', 'LIST_BASED', 'IDENTIFIERS_LIST_BASED',
];
const POPULATING_TASK_BASE = {
  type: 'POPULATING',
  inputParameters: { generateThngs: true },
};
const FILE_FORMATS = ['CSV', 'ZIP'];

const apiRequest = (url) => {
  const apiKey = key.resolveKey(config.get('using'));
  return evrythng.api({ url, apiKey });
};

const getShortDomains = async () => {
  const accounts = await apiRequest('/accounts');
  return apiRequest(`/accounts/${accounts[0].id}/shortDomains`);
};

const buildFixedAmount = async (task) => {
  task.inputParameters.type = 'FIXED_AMOUNT';
  task.inputParameters.quantity = await prompt.getInteger('Quantity');
  task.inputParameters.thngTemplate = await prompt.getJSON('Thng template');

  task.inputParameters.generateRedirections = await prompt.getBoolean('Generate redirections');
  if (task.inputParameters.generateRedirections) {
    task.inputParameters.defaultRedirectUrl = await prompt.getValue('Default redirect URL');

    const shortDomains = await getShortDomains();
    task.inputParameters.shortDomain = await prompt.getChoice('Short domain', shortDomains);
    task.inputParameters.shortIdTemplate = SHORT_ID_TEMPLATE;
  }

  return task;
};

const buildFileBased = async (task) => {
  task.inputParameters.type = 'FILE_BASED';
  task.inputParameters.generateRedirections = true;
  task.inputParameters.shortIdTemplate = SHORT_ID_TEMPLATE;
  task.inputParameters.location = await prompt.getValue('File URL');
  task.inputParameters.format = await prompt.getChoice('File format', FILE_FORMATS);
  task.inputParameters.defaultRedirectUrl = await prompt.getValue('Default redirect URL');

  const shortDomains = await getShortDomains();
  task.inputParameters.shortDomain = await prompt.getChoice('Short domain', shortDomains);
  task.inputParameters.thngTemplate = await prompt.getJSON('Thng template');
  return task;
};

const buildListBased = async (task) => {
  task.inputParameters.type = 'LIST_BASED';
  task.inputParameters.generateRedirections = true;
  task.inputParameters.shortIdTemplate = SHORT_ID_TEMPLATE;
  task.inputParameters.defaultRedirectUrl = await prompt.getValue('Default redirect URL');

  const shortDomains = await getShortDomains();
  task.inputParameters.shortDomain = await prompt.getChoice('Short domain', shortDomains);
  task.inputParameters.thngTemplate = await prompt.getJSON('Thng template');

  const ids = await prompt.getArray('ID list');
  task.inputParameters.inputData = ids.map(item => ({ shortId: item }));
  return task;
};

const buildCustomIdentifier = async () => {
  const customKey = await prompt.getValue('Custom identifier key (string)');
  const values = await prompt.getArray('identifier values');
  return { key: customKey, values };
};

const buildIdentifiersListBased = async (task) => {
  task.inputParameters.type = 'IDENTIFIERS_LIST_BASED';
  task.inputParameters.generateRedirections = false;
  task.inputParameters.thngTemplate = await prompt.getJSON('Thng template');
  task.inputParameters.customIdentifier = await buildCustomIdentifier();
  return task;
};

const buildPopulatingTask = async () => {
  const inputType = await prompt.getChoice('Input type', POPULATING_INPUT_TYPES);
  const builders = {
    FIXED_AMOUNT: buildFixedAmount,
    FILE_BASED: buildFileBased,
    LIST_BASED: buildListBased,
    IDENTIFIERS_LIST_BASED: buildIdentifiersListBased,
  };

  const task = Object.assign({}, POPULATING_TASK_BASE);
  return builders[inputType](task);
};

const buildShortIdTemplate = async () => {
  const template = {};

  template.type = await prompt.getChoice('Template type', SHORT_ID_TEMPLATE_TYPES);
  if (template.type === 'SEQUENTIAL') {
    template.start = await prompt.getInteger('Start value');
    template.increment = await prompt.getInteger('Increment value');

    template.padding = await prompt.getChoice('Padding type', SHORT_ID_PADDING_TYPES);
    if (template.padding === 'CHAR') {
      template.paddingChar = await prompt.getValue('Padding character (char)');
    }
  }

  template.length = await prompt.getInteger('ID length');
  template.prefix = await prompt.getValue('Prefix (string)');
  template.suffix = await prompt.getValue('Suffix (string)');
  template.separator = await prompt.getValue('Separator character (char)');
  return template;
};

const buildShortIdGenerationTask = async () => {
  const task = Object.assign({}, SHORT_ID_GENERATION_BASE);
  task.inputParameters.quantity = await prompt.getInteger('Quantity');
  task.inputParameters.shortIdTemplate = await buildShortIdTemplate(task);

  return task;
};

const task = async () => {
  const taskType = await prompt.getChoice('Task type', TASK_TYPES);
  const builders = {
    POPULATING: buildPopulatingTask,
    SHORT_ID_GENERATION: buildShortIdGenerationTask,
  };

  const result = await builders[taskType]();
  logger.info(`\nTask:\n${JSON.stringify(result, null, 2)}\n`);
  return result;
};


// ------------------------------ Regular Resources ----------------------------

// Some properties are writable, just not at create time
const NON_CREATE_PROPERTIES = [
  'scopes',
  'properties',
  'fn',
  'startsAt',
  'endsAt',
  'location',
];

// Values that are always the same value, and are not in the creation spec
const HARDCODE_MAP = {
  socialNetworks: {},
};

const getKeyName = async () => prompt.getValue(indent('key', 2));

const buildCustomObject = async () => {
  const result = {};

  let keyName = await getKeyName();
  while (keyName) {
    result[keyName] = await prompt.getValue(indent('value', 2));
    keyName = await getKeyName();
  }

  return result;
};

const buildDefObject = async (opts) => {
  const { key: keyName, target, index, total, propertyDef } = opts;

  // User-definable fields are not documented, present free-form
  const freeformObjects = ['customFields', 'identifiers'];
  if (freeformObjects.includes(keyName)) {
    logger.info(`${index + 1}/${total}: ${keyName} (object, leave 'keyName' blank to finish)`);
    target[keyName] = await buildCustomObject();
    return;
  }

  // Recurse
  target[keyName] = {};
  await buildObject(target[keyName], propertyDef.properties, keyName);
};

const buildDefProperty = async (opts) => {
  const { index, total, target, key: keyName, propertyDef } = opts;

  // Fields with only one allowed value
  if (HARDCODE_MAP[keyName]) {
    target[keyName] = HARDCODE_MAP[keyName];
    logger.info(`${index + 1}/${total}: ${keyName} is always ${JSON.stringify(HARDCODE_MAP[keyName])}`);
    return;
  }

  // Build sub-object
  // TODO handle sub-object properties
  if (propertyDef.type === 'object') {
    await buildDefObject({ key: keyName, target, index, total, propertyDef });
    return;
  }

  // Determine type hint string
  let typeStr = propertyDef.type;
  if (propertyDef.type === 'array') {
    typeStr = `comma-separated list of ${propertyDef.items.type}`;
  }
  if (propertyDef.enum) {
    typeStr = `${propertyDef.type}, one of '${propertyDef.enum.join('\', \'')}'`;
  }

  // Get a simple value
  const input = await prompt.getValue(`${index + 1}/${total}: ${keyName} (${typeStr})`);
  if (!input) {
    return;
  }

  // Handle input arrays as comma-separated values
  // TODO handle arrays of non-strings?
  if (propertyDef.type === 'array') {
    if (propertyDef.items.type === 'string') {
      target[keyName] = input.split(',');
      return;
    }

    if (['integer', 'number'].includes(propertyDef.items.type)) {
      target[keyName] = input.split(',').map(parseInt);
      return;
    }
  }

  // Simple value
  target[keyName] = input;
};

const filteredPropertyKeys = properties => Object.keys(properties)
  .filter(item => !properties[item].readOnly)
  .filter(item => !NON_CREATE_PROPERTIES.includes(item));

const buildObject = async (properties, name) => {
  const propertyKeys = filteredPropertyKeys(properties);
  const context = name ? `of ${name} ` : '';
  logger.info(`\nProvide values for each field ${context}(or leave blank to skip):\n`);

  const payload = {};
  for (let index = 0; index < propertyKeys.length; index += 1) {
    const keyName = propertyKeys[index];
    await buildDefProperty({
      key: keyName,
      index,
      total: propertyKeys.length,
      target: payload,
      propertyDef: properties[keyName],
    });
  }

  logger.info();
  return payload;
};

const resource = async (defName) => {
  const { definitions } = await jsonSchemaParser.dereference(evrythngSwagger);
  if (!definitions[defName]) {
    throw new Error(`\ndefName ${defName} not found in spec!`);
  }

  const payload = await buildObject(definitions[defName].properties);
  return payload;
};


// ------------------------------------ API ------------------------------------

module.exports = {
  resource,
  task,
};
