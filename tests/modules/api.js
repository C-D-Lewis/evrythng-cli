/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { expect } = require('chai');
const { NAME, mockApi } = require('../util');
const api = require('../../src/modules/api');
const commands = require('../../src/modules/commands');

const GREET_COMMAND = {
  about: 'Greet someone by name.',
  firstArg: 'greet',
  operations: {
    greetSomeone: {
      execute: ([name]) => console.log(`Hello, ${name}!`),
      pattern: '$name',
    },
  },
};

describe('api', () => {
  it('should not throw when loading all nearby plugins', () => {
    const loadAllPlugins = () => api.loadPlugins();
    expect(loadAllPlugins).to.not.throw();
  });

  it('should not throw when adding a valid command', () => {
    const addCommand = () => api.API.registerCommand(GREET_COMMAND);
    expect(addCommand).to.not.throw();
  });

  it('should throw when adding an invalid command', () => {
    const invalidCommand = {
      about: 'Greet someone by name.',
      operations: {
        greetSomeone: {
          executes: ([name]) => console.log(`Hello, ${name}!`),
          pattern: '$name',
        },
      },
    };

    const addCommand = () => api.API.registerCommand(invalidCommand);
    expect(addCommand).to.throw();
  });

  it('should have correctly added a new command', () => {
    const found = commands.COMMAND_LIST.find(item => item.firstArg === GREET_COMMAND.firstArg);

    expect(found).to.be.an('object');
  });

  it('should provide config.options', () => {
    const options = api.API.getOptions();

    expect(options).to.be.an('object');
  });

  it('should provide config.switches', () => {
    const switches = api.API.getSwitches();

    expect(switches).to.be.an('object');
  });

  it('should allow a command to be run', async () => {
    mockApi()
      .get('/products?perPage=30')
      .reply(200, [{ name: NAME }]);

    await api.API.runCommand(['products', 'list']);
  });

  it('should receive the JSON response for an API command', async () => {
    mockApi()
      .get('/products?perPage=30')
      .reply(200, [{ name: NAME }]);

    const res = await api.API.runCommand(['products', 'list']);
    expect(res).to.be.an('array');
    expect(res).to.have.length.gte(0);
  });

  it('should provide access to config interface', () => {
    const config = api.API.getConfig();

    expect(config.get).to.be.a('function');
    expect(config.set).to.be.a('function');
  });

  it('should provide access to operators', () => {
    const config = api.API.getConfig();

    const operators = config.get('operators');
    expect(operators).to.be.an('object');
  });

  it('should provide access to selected operator name', () => {
    const config = api.API.getConfig();

    const using = config.get('using');
    expect(using).to.be.a('string');
  });

  it('should provide access to the current CLI version', () => {
    const { version } = api.API;

    expect(version).to.be.a('string');
  });

  it('should accept a lesser plugin version requirement', () => {
    const { version, requireVersion } = api.API;

    expect(() => requireVersion(version)).to.not.throw();
  });

  it('should reject a larger plugin version requirement than the current', () => {
    const { version, requireVersion } = api.API;
    const [major, minor, patch] = version.split('.');
    const futureVersion = `${major}.${parseInt(minor, 10) + 1}.${patch}`;

    expect(() => requireVersion(futureVersion)).to.throw();
  });

  it('should reject a semver incompatible major requirement', () => {
    const { version, requireVersion } = api.API;
    const [major, minor, patch] = version.split('.');
    const futureVersion = `${major + 1}.${minor}.${patch}`;

    expect(() => requireVersion(futureVersion)).to.throw();
  });

  it('should provide access to the current Operator scope', async () => {
    mockApi()
      .persist()
      .get('/access')
      .reply(200, { actor: { id: 'foo' } });

    mockApi()
      .get('/operators/foo')
      .reply(200, {
        id: 'foo',
        apiKey: '12341234avjUJj429r0GrABM7nMHzjhgk822333337Fzv9e5xLhXbOZTsfFzKENtZcf4k9HjHMrW1234',
      });

    const op = await api.API.getOperatorScope();

    expect(op.id).to.equal('foo');
    expect(op.apiKey).to.have.length(80);
  });
});
