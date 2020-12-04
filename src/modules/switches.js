/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

/**
 * List of switches available.
 *
 * New ones must also be implemented in buildQueryParams() in http.js
 */
const SWITCH_LIST = [
  // Platform query parameters
  {
    name: '--filter',
    about: 'Specify a Platform filter, such as \'tags=test\'.',
    constant: 'FILTER',
    valueLabel: '<query>',
  },
  {
    name: '--per-page',
    about: 'Specify number of resources per page.',
    constant: 'PER_PAGE',
    valueLabel: '<count>',
  },
  {
    name: '--project',
    about: 'Specify the \'project\' query parameter.',
    constant: 'PROJECT',
    valueLabel: '<project ID>',
  },
  {
    name: '--with-scopes',
    about: 'Include resource scopes in the response.',
    constant: 'SCOPES',
  },
  {
    name: '--context',
    about: 'Specify the \'context=true\' query parameter.',
    constant: 'CONTEXT',
  },
  {
    name: '--page',
    about: 'Iterate to a specific page of results.',
    constant: 'PAGE',
    valueLabel: '<page>',
  },
  {
    name: '--ids',
    about: 'Specify the \'ids\' query parameter with a list of specific IDs.',
    constant: 'IDS',
    valueLabel: '<list of IDs>',
  },
  {
    name: '--with-errors',
    about: 'Specify the \'withErrors=true\' query parameter.',
    constant: 'WITH_ERRORS',
  },
  {
    name: '--with-ids',
    about: 'Specify the \'witIds=true\' query parameter.',
    constant: 'WITH_IDS',
  },

  // CLI helper switches
  {
    name: '--summary',
    about: 'Show a list of resources as a summarised (id, name) single-line format.',
    constant: 'SUMMARY',
  },
  {
    name: '--api-key',
    about: 'Use another API key or operator name instead of the current Operator\'s API key.',
    constant: 'API_KEY',
    valueLabel: '<API key|operator name>',
  },
  {
    name: '--expand',
    about: 'Expand some ID fields, timestamps to date, etc.',
    constant: 'EXPAND',
  },
  {
    name: '--build',
    about: 'Interactively build a create request payload using evrythng/swagger',
    constant: 'BUILD',
  },
  {
    name: '--field',
    about: 'Print only a certain field from the response.',
    constant: 'FIELD',
    valueLabel: '<key>',
  },
  {
    name: '--simple',
    about: 'Print response in non-JSON friendly format.',
    constant: 'SIMPLE',
  },
  {
    name: '--silent',
    about: 'Don\'t output response.',
    constant: 'SILENT',
  },

  // Import/export switches
  {
    name: '--to-csv',
    about: 'Output array response to a CSV file, such as \'./data.csv\'.',
    constant: 'TO_CSV',
    valueLabel: '<output file>',
  },
  {
    name: '--to-page',
    about: 'Read up to 30 pages before returning results (only with --to-csv).',
    constant: 'TO_PAGE',
    valueLabel: '<page>',
  },
  {
    name: '--from-csv',
    about: 'Load resources from a CSV file that was previously exported with --to-csv.',
    constant: 'FROM_CSV',
    valueLabel: '<input file>',
  },
  {
    name: '--with-redirections',
    about: 'When importing/exporting, include each resource\'s redirection URL.',
    constant: 'WITH_REDIRECTIONS',
    valueLabel: '<short domain>',
  },
  {
    name: '--from-json',
    about: 'Load resource from a JSON array file.',
    constant: 'FROM_JSON',
    valueLabel: '<input file>',
  },
  {
    name: '--to-json',
    about: 'Output array response to a JSON file as an array.',
    constant: 'TO_JSON',
    valueLabel: '<input file>',
  }
];

const apply = (args) => {
  args
    .filter(item => item.includes('--'))
    .forEach((arg) => {
      const valid = SWITCH_LIST.find(({ name }) => name === arg);
      if (!valid) {
        throw new Error(`Invalid switch: ${arg}.\nType 'evrythng help' to see a list of available switches.`);
      }

      const foundIndex = args.indexOf(arg);
      const rule = SWITCH_LIST.find(({ name }) => name === arg);
      const { constant, valueLabel } = rule;

      // For CLI
      module.exports[constant] = valueLabel ? args[foundIndex + 1] : true;

      // For API
      module.exports.active[constant] = valueLabel ? args[foundIndex + 1] : true;

      args.splice(foundIndex, valueLabel ? 2 : 1);
    });

  return args;
};

module.exports = {
  SWITCH_LIST,
  apply,
  active: {},
};
