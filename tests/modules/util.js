/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const prompt = require('../../src/modules/prompt');
const switches = require('../../src/modules/switches');
const util = require('../../src/modules/util');

const { expect } = chai;
chai.use(chaiAsPromised);

describe('util', () => {
  afterEach(() => {
    switches.BUILD = false;
    sinon.resetBehavior();
  });

  it('should know an ID is 24 characters long', () => {
    const id = 'UKAVpbnsVDPa9Kaaam7a5tdp';

    const isId = () => util.isId(id);
    expect(isId()).to.equal(true);
  });

  it('should pretty format a JSON string', () => {
    const json = [{key: 'value'}];
    const expected = '[\n  {\n    "key": "value"\n  }\n]';

    const pretty = () => util.pretty(json);
    expect(pretty()).to.equal(expected);
  });

  it('should not throw error for printListSummary()', () => {
    const list = [
      { id: 'UKAVpbnsVDPa9Kaaam7a5tdp', name: 'thng1' },
      { id: 'UKAVpbnsVDPa9Kaaam7a5td2', name: 'thng2' }
    ];

    const printListSummary = () => util.printListSummary(list);
    expect(printListSummary).to.not.throw();
  });

  it('should not throw error for printSimple()', () => {
    const data = [
      { id: 'UKAVpbnsVDPa9Kaaam7a5tdp', name: 'thng1' },
      { id: 'UKAVpbnsVDPa9Kaaam7a5td2', name: 'thng2' }
    ];

    const printSimple = () => util.printSimple(data);
    expect(printSimple).to.not.throw();
  });

  it('should not throw an error for requireKey', () => {
    const key = '12345687123456812345678123456781234567812345678123456871234568712345678123465781';
    switches.API_KEY = key;

    const requireKey = () => util.requireKey('Application');
    expect(requireKey).to.not.throw();

    switches.API_KEY = undefined;
  });

  it('should throw if a required key is not provided', () => {
    const requireKey = () => util.requireKey('Application');
    expect(requireKey).to.throw();
  });

  it('should build a correct thng payload using the user prompts', async () => {
    switches.BUILD = true;
    sinon.stub(prompt, 'getValue')
      .onCall(0).returns('TestThng')
      .returns('');

    const payload = await util.getPayload('ThngDocument');
    expect(payload).to.have.property('name', 'TestThng');
    switches.BUILD = undefined;
  });

  it('should throw if builder JSON string is invalid JSON', async () => {
    const getPayload = util.getPayload('foo', 'thisinotjson');
    return expect(getPayload).to.eventually.be.rejected;
  });

  it('should build the correct thng payload using JSON', async () => {
    const payload = await util.getPayload('ThngDocument', '{"name":"TestThng"}');
    expect(payload).to.have.property('name', 'TestThng');
  });
});
