/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const api = require('./modules/api');
const commands = require('./modules/commands');
const config = require('./modules/config');
const operator = require('./commands/operator');
const logger = require('./modules/logger');
const printHelp = require('./functions/printHelp');
const switches = require('./modules/switches');

const main = async () => {
  try {
    await operator.checkFirstRun();

    // Don't let bad plugins prevent launch
    try {
      api.loadPlugins();
    } catch (e) {
      logger.error(e);
    }

    const args = switches.apply(process.argv.slice(2));
    const command = commands.identify(args);
    if (!command) {
      printHelp();
      return;
    }

    operator.applyRegion();
    await command.execute(args.slice(1));
  } catch (e) {
    const { errorDetail } = config.get('options');

    // Transform fetch error response
    if (typeof e.ok !== 'undefined' && !e.ok) {
      e = await e.json().catch(() => e.text());
    }

    // String?
    try {
      e = JSON.parse(e);
    } catch (e1) {}

    // API error response
    if (e.errors) {
      const errStr = errorDetail ? JSON.stringify(e, null, 2) : e.errors[0];
      logger.error(`\nEVRYTHNG Error (${e.status}): ${errStr}`);
      return;
    }

    // Native error
    if (e.message) {
      const errStr = errorDetail ? e.stack : e.message;
      logger.error(`\n${errStr}`);
      return;
    }

    // Some other unknown type
    console.log(e);
  }
};

main();
