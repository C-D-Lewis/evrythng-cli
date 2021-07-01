/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const switches = require('./switches');

/** Full list of command modules */
const COMMAND_LIST = [
  require('../commands/access-policy'),
  require('../commands/access-token'),
  require('../commands/access'),
  require('../commands/accesses'),
  require('../commands/account'),
  require('../commands/account-config'),
  require('../commands/action-type'),
  require('../commands/action'),
  require('../commands/adi-order'),
  require('../commands/app-user'),
  require('../commands/batch'),
  require('../commands/collection'),
  require('../commands/file'),
  require('../commands/help'),
  require('../commands/key'),
  require('../commands/option'),
  require('../commands/place'),
  require('../commands/product'),
  require('../commands/project'),
  require('../commands/purchase-order'),
  require('../commands/rate-limit'),
  require('../commands/redirector'),
  require('../commands/region'),
  require('../commands/role'),
  require('../commands/shipment-notice'),
  require('../commands/thng'),
  require('../commands/url'),
];

/**
 * Format a pattern with short verbs included.
 *
 * @param {string} pattern - Pattern to format.
 * @returns {string} Pattern with short verbs added.
 */
const formatWithShortVerbs = pattern => pattern
  .replace('create', '[create|c]')
  .replace('list', '[list|l]')
  .replace('read', '[read|r]')
  .replace('update', '[update|u]');

/**
 * Show syntax options for a given command.
 *
 * @param {object} command - The command to display.
 */
const showSyntax = (command) => {
  const { firstArg, operations } = command;
  const finalFirstArg = Array.isArray(firstArg) ? `[${firstArg.join('|')}]` : firstArg;
  const specs = Object.keys(operations).map((item) => {
    const { pattern, helpPattern } = operations[item];
    return `  evrythng ${finalFirstArg} ${formatWithShortVerbs(helpPattern || pattern)}`;
  });

  throw new Error(`Available operations for '${finalFirstArg}':\n${specs.join('\n')}`);
};

/**
 * Take an arg and pattern spec piece and validate they match.
 *
 * @param {string} arg - The argument value, such as 'Ur2Ta6GEFfVAfbCdFd7KnpTd'
 * @param {string} spec - The pattern spec piece, such as '$id'
 * @returns {boolean} true if the arg should validate.
 */
const matchArg = (arg = '', spec) => {
  const map = {
    // Value can be an EVRYTHNG ID, an identifier string, or some customer ID format
    $id: val => val.length > 0,
    // Value must be JSON
    $payload: (val) => {
      // Some switches work instead of a payload
      if (switches.BUILD || switches.FROM_CSV || switches.FROM_JSON) {
        return true;
      }

      try {
        return typeof JSON.parse(val) === 'object';
      } catch (e) {
        return false;
      }
    },
  };

  // Must match a map value
  if (map[spec]) {
    return map[spec](arg);
  }

  // or be a labelled value, such as $type for actions
  if (spec.startsWith('$')) {
    return true;
  }

  // CRUD verbs can be shorthand
  if (spec === 'create') return ['create', 'c'].includes(arg);
  if (spec === 'list') return ['list', 'l'].includes(arg);
  if (spec === 'read') return ['read', 'r'].includes(arg);
  if (spec === 'update') return ['update', 'u'].includes(arg);
  // But NOT delete, which should always be explicit

  // else must be the same as the pattern spec
  return arg === spec;
};

const matchArgs = (args, pattern) => pattern.split(' ').every((item, i) => matchArg(args[i], item));

const identify = args => COMMAND_LIST.reduce((result, item) => {
  if (result) return result;

  // Repl is special command
  if (args[0] === 'repl') return require('./repl');

  const { operations, firstArg } = item;

  // firstArg matches (string, or array with aliases)
  const commandIdentified = Array.isArray(firstArg)
    ? firstArg.includes(args[0])
    : args[0] === firstArg;
  if (commandIdentified) {
    const match = Object.keys(operations)
      .find(item2 => matchArgs(args.slice(1), operations[item2].pattern));

    // Some command pattern matches as well
    if (match) {
      return operations[match];
    }

    // Only a partial match
    showSyntax(item);
    return result;
  }

  return result;
}, false);

module.exports = {
  identify,
  COMMAND_LIST,
  showSyntax,
  matchArg,
  matchArgs,
};
