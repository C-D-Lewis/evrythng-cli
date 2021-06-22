/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { isEqual } = require('lodash');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const neatCsv = require('neat-csv');
const { mockApi } = require('../util');
const csvFile = require('../../src/modules/csvFile');
const switches = require('../../src/modules/switches');
const util = require('../../src/modules/util');

const { expect } = chai;
chai.use(chaiAsPromised);

const CSV_PATH = `${__dirname}/output.csv`;
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
const TEST_ROWS = [
  'id,name,tags,product,collections,position,address.street,address.city,address.countryCode,customFields.foo,customFields.baz,identifiers.storeCode,identifiers.gs1:21,properties.color,properties.serial_number,properties.is_active',
  'U5GSbgP7KwddXtRRwkwxYgPq,"Name, with commas",some|tags,UKGwQrgHq3shEqRaw2KyTt2n,UH4nVsWVMG8EEqRawkMnybMh|UHHHeHc5MGsYhqRawF6Hybgg,-0.119123|51.519435,East Road,London,GB,bar,,d29hf89,,red,123,true',
  'UpmSnYxUDDbasCwwRkRNQehq,Thng2,,,,,,,,,123,,4837289,,,',
  'UK3x87gBpwAAXtawamsKRtmr,Thng3,,,,,,,,,,,,,,',
];

describe('csvFile', () => {
  after(() => {
    fs.unlinkSync(CSV_PATH);
  });

  afterEach(() => {
    switches.FROM_CSV = '';
    switches.WITH_REDIRECTIONS = '';
  });

  it('should convert objects to CSV rows', async () => {
    const rows = await csvFile.createCsvData(TEST_OBJECTS);
    expect(isEqual(rows, TEST_ROWS)).to.equal(true);
  });

  it('should not throw when writing to a CSV file', async () => {
    const writeCsvFile = () => csvFile.write(TEST_OBJECTS, CSV_PATH);
    expect(writeCsvFile).to.not.throw();
  });

  it('should throw if the specified file doesn\'t exist', async () => {
    switches.FROM_CSV = 'badpath.txt';
    const promise = csvFile.read('thng');
    return expect(promise).to.eventually.be.rejected;
  });

  it('should have written the correct content to file', () => {
    const rows = fs.readFileSync(CSV_PATH, 'utf8').toString().split('\n');
    expect(rows).to.have.length(TEST_ROWS.length);
    rows.forEach((item, i) => {
      expect(rows[i]).to.equal(TEST_ROWS[i]);
    });
  });

  it('should add a key to an object property', () => {
    const prefixKey = 'customFields.testKey';
    const [, realKey] = prefixKey.split('.');
    const testValue = 'testValue';
    const simpleObj = { customFields: {} };

    csvFile.assignPrefixProperty(simpleObj, 'customFields', prefixKey, testValue);
    expect(simpleObj.customFields[realKey]).to.equal(testValue);
  });

  it('should add a key to a non-existent object property', () => {
    const prefixKey = 'customFields.testKey';
    const [, realKey] = prefixKey.split('.');
    const testValue = 'testValue';
    const simpleObj = {};

    csvFile.assignPrefixProperty(simpleObj, 'customFields', prefixKey, testValue);
    expect(simpleObj.customFields).to.be.an('object');
    expect(simpleObj.customFields[realKey]).to.equal(testValue);
  });

  it('should convert a row into an object', async () => {
    const rowObjs = await neatCsv(TEST_ROWS.join('\n'));
    const result = csvFile.rowToObject(rowObjs[0]);

    const expected = {
      name: 'Name, with commas',
      tags: [ 'some', 'tags' ],
      customFields: { foo: 'bar' },
      product: 'UKGwQrgHq3shEqRaw2KyTt2n',
      properties: { 
        color: 'red', 
        serial_number: 123,
        is_active: true,
      },
      identifiers: { storeCode: 'd29hf89' },
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
    };
    expect(isEqual(result, expected)).to.equal(true);
  });

  it('should encode a simple JSON object', () => {
    const obj = { foo: 'bar', baz: 'thng' };
    const expected = '{foo:bar|baz:thng}';
    expect(csvFile.encodeObject(obj)).to.equal(expected);    
  });

  it('should decode a simple JSON object encoded string', () => {
    const objStr = '{foo:bar|baz:thng}';
    const expected = { foo: 'bar', baz: 'thng' };
    const result = csvFile.decodeObject(objStr);
    expect(isEqual(result, expected)).to.equal(true);    
  });

  it('should not throw when reading from a CSV file', async () => {
    const mock = mockApi()
      .persist()
      .post('/thngs?')
      .reply(201, {});

    // Includes Operator creation
    const accessMock = mockApi()
      .persist()
      .get('/access')
      .reply(200, { actor: { id: '123' } })

    switches.FROM_CSV = CSV_PATH;
    await csvFile.read('thng');
    mock.persist(false);
    accessMock.persist(false);
  });

  it('should escape commas and double quotes', () => {
    const input = 'A "string", including a comma';
    const expected = '"A ""string"", including a comma"';
    const result = csvFile.escapeCommas(input);
    expect(isEqual(result, expected)).to.equal(true);
  });

  it('should encode a sub-object', () => {
    const result = csvFile.encodeSubObject([], 'foo', { bar: 'baz', coca: 'cola' });
    const expected = ['{bar:baz|coca:cola}'];
    expect(isEqual(result, expected)).to.equal(true);
  });

  it('should not throw for a resource not compatible with redirections', async () => {
    const promise = util.createRedirection({}, {}, 'place', 'https://example.com');
    return expect(promise).to.eventually.be.fulfilled;
  });

  it('should create valid redirection creation options', () => {
    const scope = { apiKey: 'abc' };
    const evrythngId = 'UH4nVsWVMG8EEqRawkMnybMh';
    const type = 'thng';
    const defaultRedirectUrl = 'https://example.com';
    switches.WITH_REDIRECTIONS = 'tn.gg';
    const expected = {
      apiUrl: 'https://tn.gg',
      url: '/redirections',
      method: 'post',
      apiKey: 'abc',
      headers: { Accept: 'application/json' },
      data: { evrythngId, defaultRedirectUrl, type },
    };

    const result = util.createRedirectionOptions(scope, evrythngId, type, defaultRedirectUrl);
    expect(isEqual(expected, result)).to.equal(true);
  });
});
