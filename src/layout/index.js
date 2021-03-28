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
  Icon,
  RadioButton,
  SkipLink
} from '@vtfk/components'

import { APP } from '../config'

import systems from '../data/systems.json'

import './styles.scss'
import './base-styles.scss'

export function Layout (props) {
  const { user, logout } = useSession()
  const [selectedSystems, setSelectedSystems] = useState(systems)
  const [openSystemsSelect, setOpenSystemsSelect] = useState(false)
  const { apiGet, apiPost } = useSession()
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('employee')
  const [searchResult, setSearchResult] = useState([])
  const [searchInputFocused, setSearchInputFocused] = useState(false)
  const [searchResultSelectedIndex, setSearchResultSelectedIndex] = useState(0)

  useEffect(() => {
    const search = async q => {
      const { result } = await apiGet(`${APP.API_URL}/search?q=${encodeURIComponent(q)}`)
      if (result) setSearchResult(result)
    }

    if (query) {
      search(query)
    } else {
      setSearchResult([])
    }

    setSearchResultSelectedIndex(0)
  }, [query, apiGet])

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
      } else if (e.key === 'Enter') {
        selectSearchResult(searchResult[searchResultSelectedIndex])
      }
    }
    window.addEventListener('keyup', onKeyup)
    return () => window.removeEventListener('keyup', onKeyup)
  }, [searchInputFocused, searchResult, searchResultSelectedIndex])

  function clickSystemsSwitch (item) {
    let tmpSystems = [...selectedSystems]
    const exists = tmpSystems.some(s => s.name === item.name)

    if (exists) {
      tmpSystems = tmpSystems.filter((c) => { return c !== item })
    } else {
      tmpSystems.push(item)
    }

    const sortedSystems = sortSystems(tmpSystems)
    setSelectedSystems(sortedSystems)
  }

  function selectAllSystemSwitch (enable) {
    setSelectedSystems(enable ? systems : [])
  }

  function sortSystems (systems) {
    return systems.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  }

  async function selectSearchResult (item) {
      systems: systems.map(system => system.short), // TODO: Må endres til selectedSystems før prod
      user: {
        ...item,
        expectedType: searchType
      }
    })

    if (result?.body?.id) {
      window.location = `/detail/${result.body.id}`
    } else {
      alert('Det skjedde noe feil.')
    }
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
                  <Paragraph className='header-description'>Et verktøy hvor du kan søke på visningsnavn, brukernavn, e-post eller personnummer. Verktøyet søker i mange systemer, og returnerer debuginfo og en visuell representasjon av feilsituasjoner.</Paragraph>
                </>
            }
            <div className='header-search-text'>
              {
                /*
                Temporary hidden
                <div className='header-search-fieldselect'>
                  <select>
                    <option value='1'>Alle felter</option>
                    <option value='2'>Fullt navn</option>
                    <option value='3'>Fødselsnr</option>
                  </select>
                  <Icon name='chevronDown' size='xsmall' />
                </div>
                */
              }
              <SearchField
                onChange={e => setQuery(e.target.value)}
                value={query}
                rounded
                style={
                  searchInputFocused && searchResult.length > 0
                    ? { boxShadow: 'none', paddingRight: 200, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: '#979797' }
                    : { boxShadow: 'none', paddingRight: 200, borderColor: '#979797' }
                }
                onFocus={() => { setSearchInputFocused(true) }}
                onBlur={() => { setSearchInputFocused(false) }}
                placeholder='Din søketekst..'
              />

              {
                searchInputFocused &&
                searchResult.length > 0 &&
                  <div className='header-search-result'>
                    <div className='search-results'>
                      {
                    searchResult.map(function (item, index) {
                      return (
                        <div onMouseDown={() => { selectSearchResult(item) }} key={index} className={`search-results-item ${index === searchResultSelectedIndex ? 'active' : ''}`}>
                          <Paragraph className='search-results-item-name'>{item.displayName}</Paragraph>
                          <Paragraph className='search-results-item-sam' size='small'>{item.samAccountName}</Paragraph>
                          <Paragraph className='search-results-item-office' size='small'>{item.office}</Paragraph>
                        </div>
                      )
                    })
                  }
                    </div>
                  </div>
              }
            </div>

            <div className='header-search-type-systems'>
              {
                /*
                Temporary hidden
                <div className='header-search-type'>
                  <RadioButton name='searchType' value='employee' label='Søk blant ansatte' checked={searchType === 'employee'} onChange={(e) => { setSearchType(e.target.value) }} />
                  <RadioButton name='searchType' value='student' label='Søk blant elever' checked={searchType === 'student'} onChange={(e) => { setSearchType(e.target.value) }} />
                </div>
                */
              }

              {
                /*
                Temporary hidden
                <div className='header-search-systems'>
                  <Paragraph size='small' onClick={() => { setOpenSystemsSelect(!openSystemsSelect) }}>
                    <strong>{selectedSystems.length === systems.length ? 'Søker i alle systemer' : `Søker i ${selectedSystems.length} ${selectedSystems.length === 1 ? 'system' : 'systemer'}`}</strong>
                  </Paragraph>
                  <div className='header-search-systems-toggle'>
                    <Icon onClick={() => { setOpenSystemsSelect(!openSystemsSelect) }} name='chevronDown' size='xsmall' />
                    {
                      openSystemsSelect &&
                        <div className='header-search-systems-list'>
                          <div className='header-search-systems-list-header'>
                            <div className='header-search-systems-list-header-title'>Valgte systemer</div>
                            <Icon name='close' size='xsmall' onClick={() => { setOpenSystemsSelect(false) }} />
                          </div>
                          <div className='header-search-systems-list-items'>
                            <div className='header-search-systems-list-item'>
                              <div className='header-search-systems-list-item-name'>Alle</div>
                              <div className={`header-search-systems-list-item-switch ${selectedSystems.length === systems.length ? 'selected' : ''}`} onClick={() => { selectAllSystemSwitch(!(selectedSystems.length === systems.length)) }} />
                            </div>
                            {
                            systems.map(function (item, index) {
                              return (
                                <div key={index} className='header-search-systems-list-item'>
                                  <div className='header-search-systems-list-item-name'>{item.name}</div>
                                  <div className={`header-search-systems-list-item-switch ${selectedSystems.some(s => s.name === item.name) ? 'selected' : ''}`} onClick={() => { clickSystemsSwitch(item) }} />
                                </div>
                              )
                            })
                          }
                          </div>
                        </div>
                    }
                  </div>
                </div>
                */
              }
            </div>
          </div>
        </div>
      </div>

      {props.children}

    </div>
  )
}
