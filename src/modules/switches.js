/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const config = require('./config');

const SWITCH_LIST = [{
  name: '--filter',
  about: 'Specify a Platform filter, such as \'tags=test\'.',
  constant: 'FILTER',
  hasValue: true,
}, {
  name: '--with-scopes',
  about: 'Include resource scopes in the response.',
  constant: 'SCOPES',
}, {
  name: '--per-page',
  about: 'Specify number of resources per page.',
  constant: 'PER_PAGE',
  hasValue: true,
}, {
  name: '--summary',
  about: 'Show a list of resources as a summarised single-line format',
  constant: 'SUMMARY',
}, {
  name: '--api-key',
  about: 'Use a specific API key instead of the current Operator\'s API Key.',
  constant: 'API_KEY',
  hasValue: true,
}, {
  name: '--expand',
  about: 'Expand some ID fields, timestamps to date, etc.',
  constant: 'EXPAND',
}, {
  name: '--field',
  about: 'Print only a certain field from the response.',
  constant: 'FIELD',
  hasValue: true,
}, {
  name: '--simple',
  about: 'Print response in non-JSON friendly format.',
  constant: 'SIMPLE',
}, {
  name: '--build',
  about: 'Interactively build a create request payload using the EVRYTHNG Swagger API description.',
  constant: 'BUILD',
}, {
  name: '--project',
  about: 'Specify the \'project\' query parameter.',
  constant: 'PROJECT',
  hasValue: true,
}, {
  name: '--page',
  about: 'Go to a specific page of results.',
  constant: 'PAGE',
  hasValue: true,
}, {
  name: '--to-csv',
  about: 'Output array response to a CSV file.',
  constant: 'TO_CSV',
  hasValue: true,
}, {
  name: '--context',
  about: 'Specify the \'context=true\' query parameter.',
  constant: 'CONTEXT',
}];

const apply = (args) => {
  args
    .filter(item => item.includes('--'))
    .forEach((arg) => {
      const valid = SWITCH_LIST.find(item => item.name === arg);
      if (!valid) {
        throw new Error(`Invalid switch: ${arg}`);
      }

      const foundIndex = args.indexOf(arg);
      const rule = SWITCH_LIST.find(item => item.name === arg);
      module.exports[rule.constant] = rule.hasValue ? args[foundIndex + 1] : true;
      args.splice(foundIndex, rule.hasValue ? 2 : 1);
    });

  return args;
};

module.exports = {
  SWITCH_LIST,
  apply,
};