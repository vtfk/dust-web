import { rest } from 'msw'
import { QuickScore } from 'quick-score'
import { APP } from '../config'

import users from './mock-users.json'

export const generateResponseObject = (response) => {
  return {
    data: response,
    count: response.length || undefined
  }
}

export const generateErrorObject = (statusCode, message, innerError) => {
  return {
    error: {
      statusCode: statusCode || 500,
      message: message || 'Unexpected error occured!',
      innerError
    }
  }
}

export const handlers = [
  rest.get(`${APP.API_URL}/search`, (req, res, ctx) => {
    const query = req.url.searchParams.get('q')
    const top = parseInt(req.url.searchParams.get('top')) || 20

    const userSearch = new QuickScore(users, ['employeeNumber', 'samAccountName', 'mail', 'displayName'])
    const searchResult = userSearch.search(query).splice(0, top)

    return res(
      ctx.status(200),
      ctx.json(generateResponseObject(searchResult))
    )
  })
]
