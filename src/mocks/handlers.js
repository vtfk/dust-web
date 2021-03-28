import { rest } from 'msw'
import { QuickScore } from 'quick-score'
import { APP } from '../config'

import users from './mock-users.json'
import mockdata from './mock-data.json'

export const generateErrorObject = (statusCode, message, innerError) => {
  return {
    error: {
      statusCode: statusCode || 500,
      message: message || 'Unexpected error occured!',
      innerError
    }
  }
}

export const useSessionStorage = key => {
  const getItems = () => {
    const val = window.sessionStorage.getItem(key)
    if (!val) return []
    return JSON.parse(val)
  }
  const setItems = items => window.sessionStorage.setItem(key, JSON.stringify(items))
  const getItem = id => getItems().find(item => item && item._id === id)
  const addItem = item => setItems([...getItems(), item])
  const updateItem = item => setItems([...getItems().filter(rep => rep._id !== item._id), item])

  return { getItem, getItems, addItem, updateItem, setItems }
}

const getRandomObjectId = () => {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
    return (Math.random() * 16 | 0).toString(16)
  }).toLowerCase()
}

const getRandomExpectedType = () => {
  const types = ['employee', 'student']
  const typeNum = Math.random() * types.length | 0
  return types[typeNum]
}

const getRandomSystems = () => {
  const systems = ['ad', 'visma', 'extens', 'aad', 'sds', 'feide']
  const systemCount = ((Math.random() * (systems.length) | 0) + 1)
  return systems.slice(0, systemCount)
}

const getUser = incompleteUser => {
  let user = null
  if (incompleteUser.displayName) user = users.find(usr => usr.displayName.toLowerCase() === incompleteUser.displayName.toLowerCase())
  if (incompleteUser.samAccountName) user = users.find(usr => usr.samAccountName.toLowerCase() === incompleteUser.samAccountName.toLowerCase())
  if (incompleteUser.userPrincipalName) user = users.find(usr => usr.userPrincipalName.toLowerCase() === incompleteUser.userPrincipalName.toLowerCase())
  return user || incompleteUser
}

const isReportCompleted = report => !!report.finished
const isFullUserObject = report => !!(report.user && report.user.domain)

export const handlers = [
  rest.get(`${APP.API_URL}/search`, (req, res, ctx) => {
    const query = req.url.searchParams.get('q')
    const top = parseInt(req.url.searchParams.get('top')) || 10

    const userSearch = new QuickScore(users, ['employeeNumber', 'samAccountName', 'mail', 'displayName'])
    const searchResult = userSearch.search(query).splice(0, top).map(result => result.item)

    return res(
      ctx.status(200),
      ctx.json(searchResult)
    )
  }),
  rest.post(`${APP.API_URL}/report`, (req, res, ctx) => {
    let { user, systems } = req.body
    const { addItem } = useSessionStorage('dust-mock__items')

    if (!user || !(user.samAccountName || user.employeeNumber || user.userPrincipalName)) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Invalid user object provided', user })
      )
    }

    // Set default values
    if (!user.expectedType) user.expectedType = getRandomExpectedType()
    if (!systems || !Array.isArray(systems)) systems = getRandomSystems()

    // Create report object
    const report = {
      _id: getRandomObjectId(),
      user,
      systems,
      started: new Date().toISOString(),
    }

    // Legg rapport i session storage, så vi finner den seinere
    addItem(report)

    const response = {
      status: 202,
      headers: {
        Location: `${APP.API_URL}/report/${report._id}`,
        'Retry-After': 3000
      },
      body: {
        id: report._id,
        statusQueryGetUri: `${APP.API_URL}/report/${report._id}`,
        user,
        systems
      }
    }

    return res(
      ctx.status(response.status),
      ctx.set(response.headers),
      ctx.json(response)
    )
  }),
  rest.get(`${APP.API_URL}/report/:id`, (req, res, ctx) => {
    const { id } = req.params
    const { getItem, updateItem } = useSessionStorage('dust-mock__items')

    const report = getItem(id)
    if (!report) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'A report with the provided id wasn\'t found', id })
      )
    }

    // Om rapporten er ferdig returnes den som den er (200)
    if (isReportCompleted(report)) {
      // Fjern systems da denne ikke trengs i dataene
      delete report.systems

      return res(
        ctx.status(200),
        ctx.json(report)
      )
    }

    // Finn komplett brukerobjekt om det kun ble gitt med enkelte felter
    if (!isFullUserObject(report)) {
      report.user = {
        expectedType: report.user.expectedType || 'employee',
        ...getUser(report.user)
      }
    }

    // Stokk om testdataene og velg ut én
    const shuffled = mockdata.sort(() => 0.5 - Math.random())
    report.data = shuffled[0]

    // Slett lastUpdated og sett finished date
    report.finished = new Date().toISOString()

    // Oppdatert sessionStorage
    updateItem(report)

    // Trenger ikke disse i body (kun i objektet som lagres i SessionStorage)
    delete report.data
    delete report.finished

    // Sett retry-after og location
    return res(
      ctx.status(202),
      ctx.json(report),
      ctx.set({
        Location: `${APP.API_URL}/report/${report._id}`,
        'Retry-After': 3000
      })
    )
  })
]
