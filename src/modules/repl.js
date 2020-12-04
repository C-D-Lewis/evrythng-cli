/* eslint-disable no-await-in-loop */

const { COMMAND_LIST } = require('../modules/commands');
const prompt = require('../modules/prompt');
const cli = require('../functions/cli');

const ALLOWED_TYPES = [
  'accounts',
  'actions',
  'action-types',
  'app-users',
  'collections',
  'files',
  'places',
  'products',
  'projects',
  'purchase-orders',
  'shipment-notices',
  'thngs',
];

const validTypes = COMMAND_LIST
  .map(p => p.firstArg)
  .map(p => (Array.isArray(p) ? p[0] : p))
  .filter(p => ALLOWED_TYPES.includes(p));

const formattedList = arr => arr.map((p, i) => `${arr.length > 9 ? ` ${i}` : i} ${p.id} ${p.name}`).join('\n');

/**
 * Test if a value is a number.
 *
 * @param {*} v - Value to test.
 */
const isNumber = (v) => {
  try {
    parseInt(v, 10);
    return true;
  } catch (e) {
    return false;
  }
}; 

/**
 * Handle the interactive loop
 */
const repl = async () => {
  let resourceType;
  let selectedResource;

  let running = true;
  while (running) {
    console.clear();

    // Choose a type
    if (!resourceType) {
      while (!validTypes.includes(resourceType)) {
        resourceType = await prompt.getValue('type');
      }
    }

    // Show list
    let resources = await cli(`${resourceType} list --silent`);
    while (!selectedResource) {
      console.clear();
      console.log(formattedList(resources));
      console.log();

      let choice;
      while (!choice) {
        const input = await prompt.getValue('select');

        // Index from list
        if (isNumber(input)) {

        }

        // ID
        if (input.length === 24) {

        }

        // Page? Filter?

        selectedResource = '';
      }
    }
  }
};

module.exports = {
  execute: repl,
};