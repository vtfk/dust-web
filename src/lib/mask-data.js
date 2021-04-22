const isValidFnr = require('./is-valid-fnr')

const generateMaskString = (char, length) => {
  const str = []
  for (let i = 0; i < length; i++) str.push(char)
  return str.join('')
}

const maskText = (data, start, end, char) => {
  end = end || data.length

  return `${data.substring(0, start)}${generateMaskString(char, end - start)}${data.substring(end, data.length)}`
}

const maskSSNInObject = (data, start, end, char) => {
  Object.getOwnPropertyNames(data).forEach(k => {
    if (typeof data[k] === 'object' && data[k] !== null) {
      data[k] = maskSSNInObject(data[k], start, end, char)
    } else if (Array.isArray(data[k])) {
      data[k] = maskSSNInArray(data[k], start, end, char)
    } else if (typeof data[k] === 'string' && isValidFnr(data[k]).valid) {
      data[k] = maskText(data[k], start, end, char)
    }
  })

  return data
}

const maskSSNInArray = (data, start, end, char) => {
  return data.map(k => {
    if (typeof k === 'string' && isValidFnr(data[k]).valid) {
      return maskText(k, start, end, char)
    } else return k
  })
}

/**
 * @typedef {Object} ssn
 * @property {String} char Character to use in masking
 * @property {Number} start (Optional) Start index for masking. If not set, index 6 is used
 * @property {Number} end (Optional) End index for masking. If not set, index 11 (end of string) is used
 */

/**
 * Object with masking options
 * @typedef {Object} Options
 * @property {ssn} ssn Options for Social Security Number masking
 */

/**
 * Mask text in input
 * @param {any} data String|JSON Object|Array
 * @param {Options} options Object with masking options
 */
module.exports = (data, options) => {
  if (!options) throw new Error('An Options object is required')
  else if (options.ssn && !options.ssn.char) throw new Error('`char` property in Options.ssn is required')
  else if (options.ssn && Number.isInteger(options.ssn.start) && Number.isInteger(options.ssn.end) && options.ssn.end < options.ssn.start) throw new Error('`end` property in Options.ssn can not be less than `start`')

  if (typeof data === 'object' && data !== null && data !== undefined) {
    if (options.ssn) data = maskSSNInObject(data, (Number.isInteger(options.ssn.start) && options.ssn.start > -1 ? options.ssn.start : 6), (Number.isInteger(options.ssn.end) && options.ssn.end > -1 ? options.ssn.end : 11), options.ssn.char)
  } else if (Array.isArray(data)) {
    if (options.ssn) data = maskSSNInArray(data, (Number.isInteger(options.ssn.start) && options.ssn.start > -1 ? options.ssn.start : 6), (Number.isInteger(options.ssn.end) && options.ssn.end > -1 ? options.ssn.end : 11), options.ssn.char)
  } else if (typeof data === 'string') {
    if (options.ssn && isValidFnr(data).valid) data = maskText(data, (Number.isInteger(options.ssn.start) && options.ssn.start > -1 ? options.ssn.start : 6), (Number.isInteger(options.ssn.end) && options.ssn.end > -1 ? options.ssn.end : 11), options.ssn.char)
  }

  return data
}
