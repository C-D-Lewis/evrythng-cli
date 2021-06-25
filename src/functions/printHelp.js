/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { COMMAND_LIST } = require('../modules/commands');
const { OPTION_LIST } = require('../commands/option');
const { SWITCH_LIST } = require('../modules/switches');
const { description, name, version } = require('../../package.json');
const config = require('../modules/config');
const indent = require('./indent');
const logger = require('../modules/logger');

/** List of CLI examples. */
const EXAMPLES = [{
  command: 'keys list',
  about: 'See all keys stored',
}, {
  command: 'keys add prod us AGiWrH5OteA4aHiM...',
  about: 'Store a new key for the US region',
}, {
  command: 'thngs list',
  about: 'Read a page of Thngs',
}, {
  command: 'thngs UpUxnWAXeMPNQraRaGmKQdHr read',
  about: 'Read a single Thng',
}, {
  command: 'products create \'{"name": "My New Product"}\'',
  about: 'Create a new product',
}, {
  command: 'thngs list --filter tags=testing --per-page 1',
  about: 'Find one tagged Thng',
}, {
  command: 'thngs create --build',
  about: 'Interactively create a Thng',
}, {
  command: 'products list --per-page 100 --to-csv products.csv',
  about: 'Save products to a CSV file',
}, {
  command: 'products create --from-csv products.csv',
  about: 'Create products from a CSV file',
}];

/**
 * Print the name and version.
 */
const printVersion = () => logger.info(`\n${name} v${version}\n${description}`);

/**
 * Find the longest of a list of strings.
 *
 * @param {Array<string>} arr - List of strings to compare.
 * @returns {number} Length of the longest string.
 */
const getMaxItemLength = arr => arr.reduce((result, p) => {
  const newLength = p.length;
  return newLength > result ? newLength : result;
}, 0);

/**
 * Print a formatted list of items, label and descriptor.
 *
 * @param {*} list - List of objects that can be formatted.
 * @param {string} labelKey - Key of the label for each item.
 * @param {string} descriptorKey - Key of the descriptor of each item.
 * @param {boolean} [sort] - true to sort the labels.
 */
const printFormattedList = (list, labelKey, descriptorKey, sort = true) => {
  let labels = list.map((p) => {
    const newLabel = (Array.isArray(p[labelKey]) ? p[labelKey].join(', ') : p[labelKey]);
    p[labelKey] = newLabel;
    return newLabel;
  });
  if (sort) {
    labels = labels.sort();
  }

  const maxPadLength = getMaxItemLength(labels);
  list.forEach((p) => {
    const padLength = maxPadLength - p[labelKey].length;
    p[labelKey] = `${p[labelKey]} ${' '.repeat(padLength)}`;
  });

  list.forEach(p => logger.info(indent(`${p[labelKey]} ${p[descriptorKey]}`, 4)));
};

module.exports = () => {
  printVersion();
  logger.info('\nBasic Usage:\n');
  logger.info(indent('$ evrythng <command> <params>... [<payload>] [<switches>...]', 4));

  logger.info('\nDocumentation:\n');
  logger.info(indent('https://github.com/C-D-Lewis/evrythng-cli#readme', 4));

  logger.info('\nAvailable Commands:\n');
  logger.info(indent('Specify a command name (or short version) below to see all its operations.\n', 4));
  printFormattedList(COMMAND_LIST.filter(item => !item.fromPlugin), 'firstArg', 'about');

  logger.info('\nAvailable Switches:\n');
  const switchList = SWITCH_LIST.map((item) => {
    item.name = `${item.name}${item.valueLabel ? ` ${item.valueLabel}` : ''}`;
    return item;
  });
  printFormattedList(switchList, 'name', 'about');

  logger.info('\nAvailable Options:\n');
  logger.info(indent('Use \'options list\' to see current option states.\n', 4));
  printFormattedList(OPTION_LIST, 'name', 'about');

  logger.info('\nUsage Examples:\n');
  printFormattedList(EXAMPLES, 'about', 'command', false);

  const pluginCommands = COMMAND_LIST.filter(item => item.fromPlugin);
  if (pluginCommands.length) {
    logger.info('\nAvailable Plugin Commands:\n');
    printFormattedList(pluginCommands, 'firstArg', 'about');
  }

  const using = config.get('using');
  const { region } = config.get('keys')[using];
  logger.info(`\n\nUsing key '${using}' (region: ${region})\n`);
};
