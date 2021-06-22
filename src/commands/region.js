/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const config = require('../modules/config');
const logger = require('../modules/logger');

const getAvailableRegions = () => Object.keys(config.get('regions'));

const checkRegionExists = (name) => {
  const items = getAvailableRegions();
  if (!items.includes(name)) {
    throw new Error(`\nRegion '${name}' not found in ${config.CONFIG_PATH}.`);
  }
};

const formatRegion = (name) => {
  const regions = config.get('regions');
  return `'${name}' (URL: ${regions[name]})`;
};

const list = () => {
  const regions = getAvailableRegions();
  if (!regions.length) {
    logger.error('No regions available.');
    return regions;
  }

  const formatted = regions.map(formatRegion).join('\n- ');
  logger.info(`\nAvailable:\n- ${formatted}\n`);
  return regions;
};

const addRegion = ([, name, apiUrl]) => {
  if (name.includes(' ')) {
    throw new Error('Name must be a single word');
  }

  const regions = config.get('regions');
  regions[name] = apiUrl;
  config.set('regions', regions);
  logger.info(`\nAdded region '${name}' for '${apiUrl}'.`);

  return regions;
};

/**
 * Remove a region from the config.
 *
 * @param {Array<string>} args - Program args.
 */
const removeRegion = ([name]) => {
  checkRegionExists(name);

  // Do not remove while in use
  const keys = config.get('keys');
  const inUse = Object.keys(keys).find(item => keys[item].region === name);
  if (inUse) throw new Error('Cannot delete a region while a stored key is using it.');

  const regions = config.get('regions');
  delete regions[name];
  config.set('regions', regions);
  logger.info(`\nRemoved region '${name}'.`);
};


// ------------------------------------ API ------------------------------------

module.exports = {
  about: 'Manage regions in the CLI configuration.',
  firstArg: 'regions',
  operations: {
    add: {
      execute: addRegion,
      pattern: 'add $name $apiUrl',
    },
    list: {
      execute: list,
      pattern: 'list',
    },
    remove: {
      execute: removeRegion,
      pattern: '$name remove',
    },
  },
  checkRegionExists,
  addRegion,
};
