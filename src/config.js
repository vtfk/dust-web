export const APP = {
  IS_MOCK: process.env.REACT_APP_IS_MOCK || false,
  API_URL: process.env.REACT_APP_API_URL || 'https://api.dust.no'
}

export const SENTRY = {
  ENABLED: !!process.env.REACT_APP_SENTRY_DSN || false,
  dsn: process.env.REACT_APP_SENTRY_DSN || process.env.SENTRY_DSN || false,
  environment: process.env.REACT_APP_SENTRY_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'
}

export const ROUTES = {
  HELP: 'help'
}

export const AUTH = {
  CONF: {
    auth: {
      clientId: process.env.REACT_APP_CLIENT_ID,
      authority: process.env.REACT_APP_AUTHORITY,
      redirectUri: process.env.REACT_APP_REDIRECT_URL,
      postLogoutRedirectUri: process.env.REACT_APP_POST_LOGOUT_URL
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: true
    }
  },
  LOGIN_REQUEST: {
    scopes: ['openid', 'profile', 'User.Read'],
    forceRefresh: true
  },
  API_REQUEST: {
    scopes: ['openid', 'profile', 'User.Read'],
    forceRefresh: false
  },
  GRAPH: {
    userInfoUrl: process.env.USER_INFO_URL || 'https://graph.microsoft.com/v1.0/me?$select=userPrincipalName,onPremisesSamaccountName,givenName,surname,displayName'
  }
}
