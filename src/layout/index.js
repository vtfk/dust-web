import React, { useState } from 'react'
import { useSession } from '@vtfk/react-msal'
import {
  Heading2,
  Logo,
  InitialsBadge,
  Paragraph,
  IconDropdownNav,
  IconDropdownNavItem,
  SearchField,
  SkipLink
} from '@vtfk/components'

import { APP } from '../config'

import systems from '../data/systems.json'

import './styles.scss'
import './base-styles.scss'

export function Layout (props) {
  const { user, logout } = useSession()
  const { apiGet, apiPost } = useSession()

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const [repackedSearchResult, setRepackedSearchResult] = useState([])

  const search = async (q) => {
    if (q) {
      const { result } = await apiGet(`${APP.API_URL}/search?q=${encodeURIComponent(q)}`)

      if (result) {
        setRepackedSearchResult(repackSearchResult(result))
      }
    } else {
      setRepackedSearchResult([])
    }

    setSearching(false)
  }

  function onChanged (q) {
    if (!q) return

    setSearching(true)
    setQuery(q)
  }

  async function generateReport (userData) {
    if (!query) return

    const body = await apiPost(`${APP.API_URL}/report`, {
      systems: systems.map(system => system.short),
      user: {
        ...userData,
        expectedType: userData && userData.domain === 'skole' ? 'student' : 'employee'
      }
    })

    if (body?.id) {
      window.location = `/detail/${body.id}`
    } else {
      window.alert('Det skjedde noe feil.')
    }
  }

  function help () {
    window.location = '/help'
  }

  function repackSearchResult (result) {
    return result.map(item => {
      return {
        ...item,
        itemTitle: item.displayName,
        itemSecondary: `${item.samAccountName} ${item.domain === 'login' ? '🤓' : '🎓'}`,
        itemDescription: item.office
      }
    })
  }

  return (
    <div className={`layout ${props.fullHeightHeader ? 'full-height' : ''}`}>
      <SkipLink href='#main-content'>Hopp til hovedinnhold</SkipLink>

      <div className='header'>
        <div className='topnav'>
          <div className='container'>
            <a href='/' className='topnav-brand'>
              <div className='brand-logo' aria-hidden>
                <Logo />
              </div>
              <div className='brand-name'>
                D.U.S.T
              </div>
            </a>

            <div className='user'>
              <div className='user-name'>
                <Paragraph>{user.displayName}</Paragraph>
              </div>
              <InitialsBadge className='user-image' firstName={user.givenName} lastName={user.surname} />
              <div className='user-menu'>
                <IconDropdownNav>
                  <IconDropdownNavItem onClick={() => help()} title='Hjelp' />
                  <IconDropdownNavItem onClick={() => logout()} title='Logg ut' />
                </IconDropdownNav>
              </div>
            </div>
          </div>
        </div>

        <div className='container header-content'>
          <div>
            {
              props.fullHeightHeader &&
                <>
                  <Heading2 as='h1' className='header-title'>Debug User Status Tool</Heading2>
                  <Paragraph className='header-description'>Et verktøy hvor du kan søke på visningsnavn, brukernavn, e-post eller personnummer. Verktøyet søker i mange systemer og returnerer debuginfo, en visuell representasjon av feilsituasjoner og eventuelle løsningsforslag.</Paragraph>
                </>
            }
          </div>
          <div className='header-search-text'>
            <SearchField
              onChange={e => onChanged(e.target.value)}
              onSearch={e => search(e.target.value)}
              debounceMs={1000}
              onSelected={value => generateReport(value)}
              autocomplete={false}
              rounded
              placeholder='Din søketekst..'
              loading={searching}
              loadingText='Søker...'
              emptyText={<>Bruker ikke funnet i AD. Søk med <button onMouseDown={() => { generateReport({ displayName: query }) }}>fullt navn</button> , <button onMouseDown={() => { generateReport({ samAccountName: query }) }}>brukernavn</button> eller <button onMouseDown={() => { generateReport({ employeeNumber: query }) }}>fødselsnummer</button></>}
              items={repackedSearchResult}
            />
          </div>
        </div>
      </div>

      {props.children}

    </div>
  )
}
