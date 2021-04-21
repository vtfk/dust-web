const validateDate = digits => {
  const day = digits.substring(0, 2)
  const month = digits.substring(2, 4)
  const year = digits.substring(4, 6)

  const date = new Date(year === '00' ? '2000' : year, month - 1, day)
  return date && (date.getMonth() + 1) === parseInt(month) && date.getDate() === parseInt(day)
}

const validateChecksum = digits => {
  let k1 = 11 - ((3 * digits[0] + 7 * digits[1] + 6 * digits[2] + 1 * digits[3] + 8 * digits[4] +
     9 * digits[5] + 4 * digits[6] + 5 * digits[7] + 2 * digits[8]) % 11)
  let k2 = 11 - ((5 * digits[0] + 4 * digits[1] + 3 * digits[2] + 2 * digits[3] + 7 *
     digits[4] + 6 * digits[5] + 5 * digits[6] + 4 * digits[7] + 3 * digits[8] + 2 * k1) % 11)

  if (k1 === 11) k1 = 0
  if (k2 === 11) k2 = 0

  return k1 < 10 && k2 < 10 && k1 === parseInt(digits[9]) && k2 === parseInt(digits[10])
}

/**
 * Resultatet som returneres fra fødselsnummervalideringen
 * @typedef {Object} ValidationResult
 * @property {boolean} valid `true` om fødselsnummeret/d-nummer/vigo-nummeret er gyldig, eller `false` om det er ugyldig.
 * @property {"Fødselsnummer"|"D-nummer"|"VIGO-nummer"} [type] Typen identifikasjon. Kun angitt om id-en er gyldig (`valid: true`)
 * @property {string} [error] Feilmeldingen om validering feilet (`valid: false`)
 */

/**
 * Validerer fødselsnummeret og returnerer type (Fødselsnummer, D-nummer eller VIGO-nummer)
 * @param {string} digits Fødselsnummeret som skal sjekkes
 * @returns {ValidationResult} Valideringsresultatet
 */
module.exports = digits => {
  if (!digits || digits.length !== 11) return { valid: false, error: 'Fødselsnummeret har ugyldig lengde' }

  const isDnr = parseInt(digits.substring(0, 1)) > 3
  const isVnr = isDnr && parseInt(digits.substring(6, 8)) === 99
  if (isVnr) return { valid: true, type: 'VIGO-nummer' }

  const type = isDnr ? 'D-nummer' : 'Fødselsnummer'

  const validDate = validateDate(isDnr ? (digits.substring(0, 1) - 4) + digits.substring(1) : digits)
  if (!validDate) return { valid: false, error: `${type}et har ugyldig dato` }

  const validChecksum = validateChecksum(digits)
  if (!validChecksum) return { valid: false, error: `${type}et er ugyldig` }

  return { valid: true, type }
}
