import React, { useEffect, useState } from 'react'
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

import { useDebounce } from 'use-debounce'

import { APP } from '../config'

import systems from '../data/systems.json'

import './styles.scss'
import './base-styles.scss'

export function Layout (props) {
  const { user, logout } = useSession()
  const { apiGet, apiPost } = useSession()

  const [query, setQuery] = useState('')
  const [searchTriggerQuery] = useDebounce(query, 1000)
  const [searching, setSearching] = useState(false)

  const [searchInputFocused, setSearchInputFocused] = useState(false)
  const [searchResult, setSearchResult] = useState([])
  const [searchResultSelectedIndex, setSearchResultSelectedIndex] = useState(0)

  useEffect(() => {
    const search = async q => {
      const { result } = await apiGet(`${APP.API_URL}/search?q=${encodeURIComponent(q)}`)

      if (result) {
        setSearchResult(result)
      }
      setSearching(false)
    }

    if (query) {
      search(query)
    } else {
      setSearchResult([])
    }

    setSearchResultSelectedIndex(0)
    // eslint-disable-next-line
  }, [searchTriggerQuery, apiGet])

  useEffect(() => {
    const pressKeyUp = () => {
      if (
        searchInputFocused &&
        searchResult.length > 0 &&
        searchResultSelectedIndex > 0
      ) {
        setSearchResultSelectedIndex(searchResultSelectedIndex - 1)
      }
    }

    const pressKeyDown = () => {
      if (
        searchInputFocused &&
        searchResult.length > 0 &&
        searchResultSelectedIndex < searchResult.length - 1
      ) {
        setSearchResultSelectedIndex(searchResultSelectedIndex + 1)
      }
    }

    const onKeyup = e => {
      if (e.key === 'ArrowUp') {
        pressKeyUp()
      } else if (e.key === 'ArrowDown') {
        pressKeyDown()
      } else if (e.key === 'Enter' && searchResult && searchResult.length > 0) {
        generateReport(searchResult[searchResultSelectedIndex])
      }
    }
    window.addEventListener('keyup', onKeyup)
    return () => window.removeEventListener('keyup', onKeyup)
    // eslint-disable-next-line
  }, [searchInputFocused, searchResult, searchResultSelectedIndex])

  function onQueryType (query) {
    setSearching(true)
    setQuery(query)
  }

  async function generateReport (userData) {
    const body = await apiPost(`${APP.API_URL}/report`, {
      systems: systems.map(system => system.short),
      user: {
        ...userData,
        expectedType: (userData?.domain === 'login' ? 'employee' : 'student') || 'employee'
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
                  <Paragraph className='header-description'>Et verktøy hvor du kan søke på visningsnavn, brukernavn eller personnummer. Verktøyet søker i mange systemer, og returnerer debuginfo og en visuell representasjon av feilsituasjoner.</Paragraph>
                </>
            }

            <div className='header-search-text'>
              <SearchField
                onChange={e => onQueryType(e.target.value)}
                autocomplete={false}
                value={query}
                rounded
                style={
                  searchInputFocused && query !== ''
                    ? { boxShadow: 'none', paddingRight: 200, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: '#979797', borderBottomWidth: 0 }
                    : { boxShadow: 'none', paddingRight: 200, borderColor: '#979797' }
                }
                onFocus={() => { setSearchInputFocused(true) }}
                onBlur={() => { setSearchInputFocused(false) }}
                placeholder='Din søketekst..'
              />

              {
                searchInputFocused &&
                query !== '' &&
                  <>
                    <div className='header-search-result'>
                      <div className='search-results'>
                        {
                          searchResult.length > 0 &&
                          searchResult.map((item, index) => {
                            return (
                              <div onMouseDown={() => { generateReport(item) }} key={index} className={`search-results-item ${index === searchResultSelectedIndex ? 'active' : ''}`}>
                                <Paragraph className='search-results-item-name'>{item.displayName}</Paragraph>
                                <Paragraph className='search-results-item-sam' size='small'>{`${item.samAccountName} ${item.domain === 'login' ? '🤓' : '🎓'}`}</Paragraph>
                                <Paragraph className='search-results-item-office' size='small'>{item.office}</Paragraph>
                              </div>
                            )
                          })
                        }

                        {
                          !searching &&
                          searchResult.length === 0 &&
                            <div className='search-results-item-message search-alternatives'>
                              <Paragraph>
                                Bruker ikke funnet i AD. Søk med <button onMouseDown={() => { generateReport({ displayName: query }) }}>fullt navn</button> eller <button onMouseDown={() => { generateReport({ employeeNumber: query }) }}>fødselsnummer</button>
                              </Paragraph>
                            </div>
                        }

                        {
                          searching &&
                            <div className='search-results-item-message search-alternatives'>
                              <Paragraph>
                                Søker...
                              </Paragraph>
                            </div>
                        }
                      </div>
                    </div>
                  </>
              }
            </div>

          </div>
        </div>
      </div>

      {props.children}

    </div>
  )
}
