/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { expect } = require('chai');
const cli = require('../../src/functions/cli');
const commands = require('../../src/modules/commands');

describe('commands', () => {
  it('should match a given argument and spec item', () => {
    // Prescribed length
    let arg = 'UKAVpbnsVDPa9Kaaam7a5tdp';
    let spec = '$id';
    expect(commands.matchArg(arg, spec)).to.equal(true);

    // Valid JSON
    arg = '{"name": "some name"}';
    spec = '$payload';
    expect(commands.matchArg(arg, spec)).to.equal(true);

    // Keyword
    arg = 'create';
    spec = 'create';
    expect(commands.matchArg(arg, spec)).to.equal(true);

    // Any value allowed
    arg = 'scans';
    spec = '$type';
    expect(commands.matchArg(arg, spec)).to.equal(true);
  });

  it('should match some args to a pattern', () => {
    const args = ['thngs', 'UKAVpbnsVDPa9Kaaam7a5tdp', 'read'];
    const pattern = 'thngs $id read';

    const res = commands.matchArgs(args, pattern);
    expect(res).to.equal(true);
  });

  it('should identify a command from some args', () => {
    const args = ['thngs', 'UKAVpbnsVDPa9Kaaam7a5tdp', 'read'];
    const expected = commands.COMMAND_LIST
      .find(item => item.firstArg.includes('thngs')).operations.readThng;

    const res = commands.identify(args);
    expect(res).to.deep.equal(expected);
  });

  it('should throw to identify a partial match', () => {
    const args = ['thngs'];
    const match = () => commands.identify(args);

    expect(match).to.throw();
  });

  it('should throw to print command syntax', () => {
    const command = commands.COMMAND_LIST.find(item => item.firstArg === 'thngs');
    const showSyntax = () => commands.showSyntax(command);

    expect(showSyntax).to.throw();
  });
});
