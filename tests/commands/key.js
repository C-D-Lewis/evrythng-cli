/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const { ctx } = require('../util');
const cli = require('../../src/functions/cli');
const key = require('../../src/commands/key');

chai.use(chaiAsPromised);

const { expect } = chai;

describe('keys', () => {
  before(async () => {
    const res = await cli('keys list');
    ctx.using = res.using;

    sinon.stub(key, 'validateCredentials').returns(Promise.resolve());
  });

  after(async () => {
    await cli(`keys ${ctx.using} use`);

    sinon.restore();
  });

  it('return object for \'keys add $name $region $apiKey\'', async () => {
    ctx.operatorName = 'test-key';
    const testKey = '12345687123456812345678123456781234567812345678123456871234568712345678123465781';
    const res = await cli(`keys add ${ctx.operatorName} us ${testKey}`);

    expect(res).to.be.an('object');
    expect(res.apiKey).to.be.a('string');
    expect(res.apiKey).to.have.length(80);

    const isValidRegionValue = val => ['us', 'eu'].includes(val);
    expect(res.region).to.satisfy(isValidRegionValue);
  });

  it('should return object for \'keys list\'', async () => {
    const res = await cli('keys list');

    expect(res).to.be.an('object');
    expect(res.keys).to.be.an('array');
    expect(res.keys).to.have.length.gte(1);
    expect(res.using).to.be.a('string');
  });

  it('should return string for \'keys $name read\'', async () => {
    const res = await cli(`keys ${ctx.operatorName} read`);

    expect(res).to.be.a('string');
    expect(res).to.have.length(80);
  });

  it('should not throw error for \'keys $name use\'', async () => {
    await cli(`keys ${ctx.operatorName} use`);
  });

  it('should not throw error for \'keys $name remove\'', async () => {
    await cli(`keys ${ctx.operatorName} remove`);
  });

  it('should throw error if key credentials are not valid', async () => {
    sinon.restore();

    const validate = key.validateCredentials('us', 'somebadapikey');
    return expect(validate).to.eventually.be.rejected;
  });
});
