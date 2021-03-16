import React from 'react'
import * as Sentry from '@sentry/react'

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { useSession } from '@vtfk/react-msal'
import { AUTH, APP } from './config'

import { Home } from './pages/Home'
import { SearchTest } from './pages/SearchTest'
import { Detail } from './pages/Detail'
import { PageNotFound } from './pages/PageNotFound'

const AppContent = () => {
  return (
    <Router>
      <div className='app'>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/searchtest' component={SearchTest} />
          <Route exact path='/detail/:id' component={Detail} />
          <Route exact path='*' component={PageNotFound} />
        </Switch>
      </div>
    </Router>
  )
}

export const App = () => {
  const { isAuthenticated, login, authStatus, user } = useSession()

  if (['pending'].includes(authStatus)) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    login(AUTH.LOGIN_REQUEST)
    return <></>
  }

  if (isAuthenticated && authStatus === 'finished') {
    Sentry.setUser({
      email: user.userPrincipalName || undefined,
      username: user.onPremisesSamAccountName || undefined,
      ip_address: '{{auto}}'
    })

    return <AppContent />
  } else if (APP.IS_MOCK) {
    return <></>
  }
}
