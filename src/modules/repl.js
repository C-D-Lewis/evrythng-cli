/* eslint-disable no-await-in-loop */

const { COMMAND_LIST } = require('../modules/commands');
const prompt = require('../modules/prompt');
const cli = require('../functions/cli');

/** Allowed types to REPL with */
const ALLOWED_TYPES = [
  'access-policies',
  'access-tokens',
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

/**
 * Format a list of resources.
 *
 * @param {Array} arr - Array to format.
 * @returns {string} List in string format.
 */
const toFormattedList = arr => arr.map((p, i) => `${i < 10 ? ` ${i}` : i} ${p.id} ${p.name}`).join('\n');

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

  console.clear();
  console.log('\nWelcome to the REPL! Begin by choosing a resource type to explore:\n');
  console.log(`Choose from: \n  - ${validTypes.join('\n  - ')}\n`);

  while (true) {
    // Choose a type
    if (!resourceType) {
      while (!validTypes.includes(resourceType)) {
        resourceType = await prompt.getValue('> type');
      }
    }

    // Show list of that type
    let page = 0;
    let filter;
    let resources = await cli(`${resourceType} list --page ${page} --silent`);
    while (!selectedResource) {
      console.clear();
      console.log(`\nPage ${page + 1} of ${resourceType}${filter ? ` with filter ${filter}` : ''}:\n`);
      console.log(toFormattedList(resources));
      console.log();

      const input = await prompt.getValue('> ID, index, \'more\', or filter');

      // Index from list
      if (isNumber(input)) {
        selectedResource = resources[parseInt(input, 10)];
      }

      // ID
      if (input.length === 24) {
        selectedResource = resources.find(p => p.id === input);
      }

      // Next?
      if (input === 'more') {
        page += 1;
        resources = await cli(`${resourceType} list --page ${page} --silent`);

        console.clear();
        console.log(`\nPage ${page + 1} of ${resourceType}:\n`);
        console.log(toFormattedList(resources));
        console.log();
      }

      // Filter
      try {
        filter = input;
        resources = await cli(`${resourceType} list --page ${page} --filter ${filter} --silent`);
      } catch (e) {
        filter = '';
      }
    }

    // Display selected resource
    console.clear();
    console.log('\nSelected resource:\n');
    console.log(JSON.stringify(selectedResource, null, 2));
    console.log();

    let operation;
    while (!operation) {
      const input = await prompt.getValue('> \'update $field $newValue\', \'delete\', or \'back\'');

      // Back
      if (input === 'back') {
        operation = true;
        selectedResource = null;
        filter = null;
      }

      // Update field

      // Delete
    }
  }
};

module.exports = {
  execute: repl,
};