const http = require('../modules/http');

// Available configuration names
const configNames = [
  'uniqueIdentifiers',
  'bi',
  'types',
  'dashboards',
  'brands',
  'consumerEngagement',
  'labels',
  'schemas',
  'regions',
];

/**
 * Get first account configuration.
 *
 * @returns {object} Account .configuration value.
 */
const getFirstAccount = async () => {
  const { data } = await http.get('/accounts', true);
  return data[0];
};

/**
 * Check a configuration name entered is valid.
 *
 * @param {string} name - Entered configuration name.
 */
const ensureNameValid = (name) => {
  if (!configNames.includes(name)) {
    throw new Error(`Configuration name '${name}' is invalid.\n\nSelect from:\n${configNames.join(', ')}`);
  }
};

// This module provides a convenience layer over the /accounts/:id/configuration API
// for the current account only - usually the first
module.exports = {
  about: 'Update account configuration.',
  firstArg: 'account-config',
  operations: {
    help: {
      execute: () => console.log(`\nSelect 'name' from:\n${configNames.join(', ')}`),
      pattern: 'help',
    },
    listAccountConfigs: {
      execute: async () => {
        const { configuration } = await getFirstAccount();
        console.log(JSON.stringify(configuration, null, 2));
      },
      pattern: 'list',
    },
    readAccountConfig: {
      execute: async ([name]) => {
        ensureNameValid(name);

        const { configuration } = await getFirstAccount();
        if (!configuration[name]) throw new Error(`Configuration '${name}' is not yet set.`);

        console.log(JSON.stringify(configuration[name], null, 2));
      },
      pattern: '$name read',
    },
    updateAccountConfig: {
      execute: async ([name, , payload]) => {
        ensureNameValid(name);

        const { id } = await getFirstAccount();
        await http.put(`/accounts/${id}/configuration/${name}`, JSON.parse(payload));
      },
      pattern: '$name update $payload',
    },
    deleteAccountConfig: {
      execute: async ([name]) => {
        ensureNameValid(name);

        const { id } = await getFirstAccount();
        await http.delete(`/accounts/${id}/configuration/${name}`);
      },
      pattern: '$name delete',
    },
  },
};
