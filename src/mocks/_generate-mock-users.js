const { writeFileSync } = require('fs')
const { dirname, join } = require('path')
const { ansattDep, elevDep } = require('./_departments')
const fregansatte = require('./_tenor-eksport-ansatt.json')
const fregelever = require('./_tenor-eksport-elev.json')

const shuffle = array => array.sort(() => 0.5 - Math.random())
const getRandom = (min, max) => Math.floor(Math.random() * max) + min
const titleCase = str => str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')
const replaceIllegalChars = (str, joinchar) => str.toLowerCase().replace(/ /g, (joinchar || '')).replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'aa')

const randomId = () => {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
    return (Math.random() * 16 | 0).toString(16)
  }).toLowerCase()
}

const getProxyAddresses = (mail, fregPerson, employee) => {
  const proxy = []
  if (getRandom(0, 50) !== 42) proxy.push(`SMTP:${mail}`)
  if (getRandom(0, 50) === 42) proxy.push(`SMTP:${mail}`)
  if (employee) {
    if (getRandom(0, 50) > 25 && fregPerson.mellomnavn) proxy.push(`smtp:${replaceIllegalChars(`${fregPerson.fornavn} ${fregPerson.etternavn}@vtfk.no`, '.')}`)
    if (getRandom(0, 50) > 25 && fregPerson.kommunenrNavn) proxy.push(`smtp:${mail.replace('vtfk.no', (parseInt(fregPerson.kommunenrNavn) < 3806 ? 'vfk.no' : 't-fk.no'))}`)
  }
  return proxy
}

const persons = []
const getUser = (fregPerson, employee = false) => {
  // Generate username
  const usernameStart = `${replaceIllegalChars(fregPerson.fornavn).substring(0, 3)}${fregPerson.id.substring(0, 4)}`
  const usernameMatch = persons.filter(per => per.samAccountName.startsWith(usernameStart)).length
  const username = `${usernameStart}${usernameMatch > 0 ? usernameMatch : ''}`

  // Generate email address
  const mail = replaceIllegalChars(`${employee ? fregPerson.visningnavn : username}@${employee ? 'vtfk.no' : 'skole.vtfk.no'}`, '.')

  const department = employee ? shuffle(ansattDep)[0] : shuffle(elevDep)[0]
  const pers = {
    id: randomId(),
    samAccountName: username,
    displayName: titleCase(fregPerson.visningnavn),
    givenName: `${titleCase(fregPerson.fornavn)}${fregPerson.mellomnavn ? ' ' + titleCase(fregPerson.mellomnavn) : ''}`,
    surName: titleCase(fregPerson.etternavn),
    mail,
    userPrincipalName: mail,
    proxyAddresses: getProxyAddresses(mail, fregPerson, employee),
    domain: employee ? 'login' : 'skole',
    employeeNumber: fregPerson.id,
    timestamp: new Date().toISOString(),
    enabled: getRandom(0, 100) !== 42,
    ou: getRandom(0, 100) === 42 ? 'AUTO DISABLED USERS' : 'AUTO USERS',
    extensionAttribute7: employee ? getRandom(0, 100) !== 42 ? 'OF-ALLE' : null : null,
    departmentShort: employee ? department.extensionAttribute6 : department.department,
    departmentAdditional: null,
    office: employee ? department.physicalDeliveryOfficeName : department.company,
    company: department.company,
    title: department.title || undefined,
    state: employee ? department.state : undefined,
    feide: employee ? getRandom(0, 100) < 50 ? true : false : undefined
  }

  persons.push(pers)
  return pers
}

const users = []
fregansatte.forEach(ansatt => users.push(getUser(ansatt, true)))
fregelever.forEach(elev => users.push(getUser(elev)))

writeFileSync(join(dirname(__filename), './mock-users.json'), JSON.stringify(users, null, 2))
