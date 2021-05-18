/**
 * (c) Copyright Reserved EVRYTHNG Limited 2018.
 * All rights reserved. Use of this material is subject to license.
 */

const { expect } = require('chai');

let config;

describe('config', () => {
  it('should not throw when loading config', () => {
    const loadConfig = () => {
      config = require('../../src/modules/config');
    };

    expect(loadConfig).to.not.throw();
  });

  it('should not throw when updating config', () => {
    const updateConfig = () => config.set('using', config.get('using'));

    expect(updateConfig).to.not.throw();
  });

  it('should not throw for valid configuration data', () => {
    const validConfig = {
      using: 'personal',
      operators: {
        personal: {
          apiKey: '16273894182364891234872347981234978129846279418294219784624732169821987462478897',
          region: 'us',
        },
      },
      options: {
        errorDetail: false,
        noConfirm: false,
        showHttp: false,
        logLevel: 'info',
        defaultPerPage: 30,
      },
      regions: {
        us: 'https://api.evrythng.com',
        eu: 'https://api-eu.evrythng.com',
      },
    };

    const validate = () => config.validateConfig(validConfig);
    expect(validate).to.not.throw();
  });

  it('should throw for invalid configuration data', () => {
    const invalidConfig = {
      operators: {
        personal: {
          apiKey: '1627389418236489123487234798123497812984627941829421978462473216982198746247889',
          region: 'us',
        },
      },
      options: {
        errorDetail: false,
        noConfirm: false,
        showHttp: false,
        logLevel: 'info',
        foo: 'bar',
      },
      regions: {
        us: 'https://api.evrythng.com',
        eu: 'https://api-eu.evrythng.com',
      },
    };

    const validate = () => config.validateConfig(invalidConfig);
    expect(validate).to.throw();
  });
});
