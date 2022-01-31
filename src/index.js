import React from 'react'
import ReactDOM from 'react-dom'
import * as Sentry from '@sentry/react'

import { Integrations } from '@sentry/tracing'
import { MsalProvider } from '@vtfk/react-msal'
import { BaseStyle } from '@vtfk/components'

import pkg from '../package.json'
import { App } from './App'
import { APP, AUTH, SENTRY } from './config'

const { name, version } = pkg

if (APP.IS_MOCK) {
  const { worker } = require('./mocks/browser')
  worker.start()
}

if (SENTRY.ENABLED) {
  Sentry.init({
    ...SENTRY,
    release: `${name}@${version}`,
    autoSessionTracking: true,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0
  })
  console.debug('Sentry initialized')
}

ReactDOM.render(
  <React.StrictMode>
    <BaseStyle>
      <MsalProvider config={AUTH.CONF} scopes={AUTH.LOGIN_REQUEST}>
        <App />
      </MsalProvider>
    </BaseStyle>
  </React.StrictMode>,
  document.getElementById('root')
)
