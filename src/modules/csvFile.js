const fs = require('fs');
const neatCsv = require('neat-csv');
const logger = require('./logger');
const switches = require('./switches');
const util = require('./util');

/* Keys that are expanded to individual columns, or do not make sense for CSV file. */
const IGNORE = [
  // SDK property
  'resource',

  // Objects that are expanded later on into individual columns
  'address',
  'properties',
  'customFields',
  'identifiers',
];

/* Keys that are complex object that aren't supported or cannot be specified for import */
const IMPORT_UNSUPPORTED = [
  'location',
];

/* Keys that are array type */
const CONVERTED_ARRAYS = [
  'photos',
  'tags',
  'collections',
  'categories',
];

/* Use a character other than ','' to encode lists and object pairs */
const LIST_SEPARATOR = '|';

/* Separates object key-value pairs */
const PAIR_SEPARATOR = ':';

/**
 * Get de-duplicated list of object keys of a specific type (denoted by prefix)
 *
 * @param {Array<object>} arr - Array of objects to search for keys.
 * @param {string} prefix - Optional prefix when searching a sub-object.
 * @returns {string[]} Array of keys found in the objects.
 */
const getAllKeys = (arr, prefix) => {
  const buildKey = item => (prefix ? `${prefix}.${item}` : item);

  return arr.reduce((res, arrItem) => {
    Object.keys(arrItem).forEach((itemKey) => {
      if (!res.includes(itemKey) && !IGNORE.includes(itemKey)) {
        res.push(itemKey);
      }
    });
    return res;
  }, []).map(buildKey);
};

/**
 * Get all applicable column headers for all objects.
 * Object, 'address', 'customFields', 'identifiers', and 'properties' are supported as types.
 *
 * @param {Array<object>} arr - Array of objects to search for keys.
 * @returns {object} Object containing a list of each kind of keys
 */
const getColumnHeaders = (arr) => {
  const object = getAllKeys(arr);
  const address = getAllKeys(arr.map(item => item.address || {}), 'address');
  const customFields = getAllKeys(arr.map(item => item.customFields || {}), 'customFields');
  const identifiers = getAllKeys(arr.map(item => item.identifiers || {}), 'identifiers');
  const properties = getAllKeys(arr.map(item => item.properties || {}), 'properties');

  return { object, address, customFields, identifiers, properties };
};

/**
 * Escape , with ", and " with ""
 *
 * @param {any} value - The value to escape.
 * @returns {string} - Escaped string of the value.
 */
const escapeCommas = (value) => {
  let output = String(value);
  if (output.includes('"')) {
    output = output.split('"').join('""');
  }
  if (output.includes(',')) {
    output = `"${output}"`;
  }

  return output;
};

/**
 * Encode a single level object into a CSV compatible format.
 *
 * @param {object} obj - The object to encode.
 * @returns {string} The encoded form.
 */
const encodeObject = (obj) => {
  const pairs = Object.keys(obj).map(key => `${key}:${obj[key]}`);
  return `{${pairs.join(LIST_SEPARATOR)}}`;
};

/**
 * Decode a single level object string from a CSV compatible format.
 *
 * @param {string} objStr - The object string to decode.
 * @returns {object} The decoded object.
 */
const decodeObject = objStr => objStr
  .slice(1, objStr.length - 1)
  .split(LIST_SEPARATOR)
  .reduce((res, pair) => {
    const [key, value] = pair.split(PAIR_SEPARATOR);
    res[key] = value;
    return res;
  }, {});

/**
 * Encode an array into the CSV row
 *
 * @param {string[]} res - Array of CSV cells so far.
 * @param {any[]} value - Array of items to encode.
 * @return {string[]} The augmented array of CSV cells.
 */
const encodeArray = (res, value) => res.concat(escapeCommas(value.join(LIST_SEPARATOR)));

/**
 * Encode a GeoJSON point object into the CSV row.
 *
 * @param {string[]} res - Array of CSV cells so far.
 * @param {number[]} coords - Coordinate pair to encode.
 * @return {string[]} The augmented array of CSV cells.
 */
const encodeGeoJson = (res, coords) => res.concat(`${coords[0]}|${coords[1]}`);

/**
 * Encode an empty cell using an empty string.
 *
 * @param {string[]} res - Array of CSV cells so far.
 * @return {string[]} The augmented array of CSV cells.
 */
const encodeEmptyCell = res => res.concat('');

/**
 * Attempt to encode a JSON sub-object into the CSV row, using a bespoke scheme.
 *
 * @param {string[]} res - Array of CSV cells so far.
 * @param {string} key - Object key to use.
 * @param {object} value - Object to encode and add to the row.
 * @return {string[]} The augmented array of CSV cells.
 */
const encodeSubObject = (res, key, value) => {
  logger.info(`Warning: Sub-object exporting not fully supported (key: ${key})`);
  return res.concat(escapeCommas(encodeObject(value)));
};

/**
 * Create row of cell values for each applicable key, else add empty cell (,).
 *
 * @param {object} obj - The object to convert to a row.
 * @param {string[]} objKeys - Array of object keys to use.
 * @returns {string[]} Array of cell values for this row.
 */
const objectToCells = (obj, objKeys) => {
  // If this object doesn't exist, add an empty cell for every key missing
  if (!obj) {
    return objKeys.reduce(res => res.concat(''), []);
  }

  // For each key, add the value as a cell to the array
  return objKeys.reduce((res, item) => {
    // Handle any prefix
    const key = item.includes('.') ? item.split('.')[1] : item;
    const value = obj[key];

    if (!value) {
      return encodeEmptyCell(res);
    }
    if (CONVERTED_ARRAYS.includes(key) && value.length) {
      return encodeArray(res, value);
    }
    if (key === 'position') {
      return encodeGeoJson(res, obj.position.coordinates);
    }
    if (String(value).includes('[object Object]')) {
      return encodeSubObject(res, item, value);
    }

    res.push(escapeCommas(value));
    return res;
  }, []);
};

/**
 * Create CSV data from input object array.
 *
 * @param {Array<object>} arr - Array of input objects to convert.
 * @returns {string[]} Array of CSV rows as strings.
 */
const createCsvData = async (arr) => {
  // Include short domain?
  await util.addResourceRedirections(arr);

  // Get all column headings
  const { object, address, customFields, identifiers, properties } = getColumnHeaders(arr);
  const columnHeaders = [
    ...object, ...address, ...customFields, ...identifiers, ...properties,
  ].join(',');

  // Convert to rows
  const rows = arr.map(item => objectToCells(item, object)
    .concat(objectToCells(item.address, address))
    .concat(objectToCells(item.customFields, customFields))
    .concat(objectToCells(item.identifiers, identifiers))
    .concat(objectToCells(item.properties, properties))
    .join(','));

  return [columnHeaders, ...rows];
};

/**
 * Assign a prefixed property to an object property
 *
 * @param {object} obj - The object to modify.
 * @param {string} objKey - The object property to modify.
 * @param {string} fullKey - The key of the property to assign.
 * @param {string} value - The value to assign.
 */
const assignPrefixProperty = (obj, objKey, fullKey, value) => {
  if (!obj[objKey]) {
    obj[objKey] = {};
  }

  const [, key] = fullKey.split('.');
  obj[objKey][key] = value;
  return obj;
};

/**
 * Preserve the type of a number or boolean that was extracted as a string token.
 *
 * @param {string} value - The string to process.
 * @returns {string|number|boolean} The extracted value in its 'original' type.
 */
const preserveType = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
};

/**
 * Decode an cell encoded as an array of values.
 *
 * @param {object} res - The object being constructed.
 * @param {string} key - Result object key.
 * @param {string} value - Array to be decoded.
 */
const decodeArray = (res, key, value) => {
  if (value.length) {
    res[key] = value.split(LIST_SEPARATOR);
  }

  return res;
};

/**
 * Decode an cell encoded as a lat/lon pair to GeoJSON object.
 *
 * @param {object} res - The object being constructed.
 * @param {string} key - Result object key.
 * @param {string} value - Coordinate pair to be decoded.
 */
const decodeGeoJson = (res, key, value) => {
  const [lon, lat] = value.split(LIST_SEPARATOR);
  res[key] = {
    type: 'Point',
    coordinates: [parseFloat(lon), parseFloat(lat)],
  };

  return res;
};

/**
 * Convert a CSV row object to an EVRYTHNG resource.
 * Some special decoding and filtering is still required.
 *
 * @param {object} row - The row to convert.
 * @returns {object} - An EVRYTHNG-compatible object representation of this CSV row.
 */
const rowToObject = row => Object.keys(row)
  .reduce((res, key) => {
    // Skip read-only keys, or empty cells
    if (util.READ_ONLY_KEYS.includes(key) || !row[key]) {
      return res;
    }

    const value = preserveType(row[key]);
    if (value === '[object Object]') {
      logger.info(`Warning: Sub-object not supported (key: ${key})`);
      return res;
    }

    if (IMPORT_UNSUPPORTED.includes(key)) {
      logger.info(`Warning: Importing not supported (key: ${key})`);
      return res;
    }

    if (CONVERTED_ARRAYS.includes(key)) {
      return decodeArray(res, key, value);
    }

    if (key.includes('address')) {
      return assignPrefixProperty(res, 'address', key, value);
    }

    if (key.includes('customFields')) {
      return assignPrefixProperty(res, 'customFields', key, value);
    }

    if (key.includes('identifiers')) {
      return assignPrefixProperty(res, 'identifiers', key, value);
    }

    if (key.includes('properties')) {
      return assignPrefixProperty(res, 'properties', key, value);
    }

    if (key === 'position') {
      return decodeGeoJson(res, key, value);
    }

    // Simple value
    res[key] = value;
    return res;
  }, {});

/**
 * Read a CSV file and upload the contents to the account.
 *
 * @param {string} type - Type of EVRYTHNG resource the items in the file should be treated as.
 * @returns {Promise} A Promise that resolves when all items have been created.
 */
const read = async (type) => {
  const encoding = switches.CSV_ENCODING || 'utf8';

  return util.readFile(
    type,
    switches.FROM_CSV, 
    path => neatCsv(fs.readFileSync(path, encoding)),
    rowToObject,
  );
};

/**
 * Write some array of EVRYTHNG objects to a CSV file.
 *
 * @param {Array} items - Array of objects to write to file.
 * @param {string} path - Path of the file to write.
 */
const write = async (items, path) => {
  const data = await createCsvData(items);

  const encoding = switches.CSV_ENCODING || 'utf8';
  fs.writeFileSync(path, data.join('\n'), encoding);
};

module.exports = {
  write,
  read,
  rowToObject,
  assignPrefixProperty,
  createCsvData,
  encodeObject,
  decodeObject,
  escapeCommas,
  encodeSubObject,
};
