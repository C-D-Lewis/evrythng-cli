/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const { mockApi } = require('../util');
const jsonFile = require('../../src/modules/jsonFile');
const switches = require('../../src/modules/switches');

const { expect } = chai;
chai.use(chaiAsPromised);

const JSON_PATH = `${__dirname}/output.json`;
const TEST_OBJECTS = [{
  id: 'U5GSbgP7KwddXtRRwkwxYgPq',
  name: 'Name, with commas',
  customFields: { foo: 'bar' },
  tags: ['some', 'tags'],
  product: 'UKGwQrgHq3shEqRaw2KyTt2n',
  identifiers: { storeCode: 'd29hf89' },
  properties: { 
    color: 'red', 
    serial_number: 123,
    is_active: true,
  },
  collections: [
    'UH4nVsWVMG8EEqRawkMnybMh',
    'UHHHeHc5MGsYhqRawF6Hybgg',
  ],
  position: {
    type: 'Point',
    coordinates: [ -0.119123, 51.519435 ],
  },
  address: {
    street: 'East Road',
    city: 'London',
    countryCode: 'GB',
  },
}, {
  id: 'UpmSnYxUDDbasCwwRkRNQehq',
  name: 'Thng2',
  customFields: { baz: 123 },
  identifiers: { 'gs1:21': 4837289 },
}, {
  id: 'UK3x87gBpwAAXtawamsKRtmr',
  name: 'Thng3',
}];

describe('jsonFile', () => {
  after(() => {
    fs.unlinkSync(JSON_PATH);
  });

  afterEach(() => {
    switches.FROM_JSON = '';
    switches.TO_JSON = '';
    switches.WITH_REDIRECTIONS = '';
  });

  it('should not throw when writing to a JSON file', async () => {
    const writeJsonFile = () => jsonFile.write(TEST_OBJECTS, JSON_PATH);
    expect(writeJsonFile).to.not.throw();
  });

  it('should throw if the specified file doesn\'t exist', async () => {
    switches.FROM_JSON = 'badpath.txt';
    const promise = jsonFile.read('thng');
    return expect(promise).to.eventually.be.rejected;
  });

  it('should have written the correct content to file', () => {
    const thngs = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
    expect(thngs).to.deep.equal(TEST_OBJECTS);
  });

  it('should not throw when reading from a JSON file', async () => {
    const mock = mockApi()
      .persist()
      .post('/thngs?')
      .reply(201, {});

    // Includes Operator creation
    mockApi()
      .persist()
      .get('/access')
      .reply(200, { actor: { id: '123' } })

    switches.FROM_JSON = JSON_PATH;
    await jsonFile.read('thng');
    mock.persist(false);
  });
});
