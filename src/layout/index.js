import React, { useState } from 'react'
import { useSession } from '@vtfk/react-msal'
import { useLocation, Link } from 'react-router-dom'
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
import ScrollLock, { TouchScrollable } from 'react-scrolllock'

import { ROUTES } from '../config'

import systems from '../data/systems.json'

import './styles.scss'
import './base-styles.scss'

export function Layout (props) {
  const { user, logout } = useSession()
  const location = useLocation()
  const [selectedSystems, setSelectedSystems] = useState(systems)
  const [openSystemsSelect, setOpenSystemsSelect] = useState(false)

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

  function selectAllSystemSwitch(enable) {
    setSelectedSystems(enable ? systems : [])
  }

  function sortSystems (systems) {
    return systems.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
  }

  return (
    <div className='layout'>
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

        <div className='container'>
          <Heading2 as='h1' className='header-title'>Debug User Status Tool</Heading2>
          <Paragraph className='header-description'>Et verktøy hvor du kan søke på visningsnavn, brukernavn, e-post eller personnummer. Verktøyet søker i mange systemer, og returnerer debuginfo og en visuell representasjon av feilsituasjoner.</Paragraph>
          <div className='header-search-text'>
            <SearchField
              placeholder='Søk på visningsnavn, brukernavn, e-post eller personnummer..'
              value=''
              onSearch={() => console.log('onSearch!')}
              rounded
            />
          </div>
          <div className='header-search-type'>
            <RadioButton name='name' value='value-1' label='Søk blant ansatte' checked onChange={(e) => { console.log(e.target.value) }} />
            <RadioButton name='name' value='value-2' label='Søk blant elever' onChange={(e) => { console.log(e.target.value) }} />
          </div>
          <div className='header-search-systems'>
            <Paragraph size='small'>
              <strong>Søker i systemene:</strong>
              {
                selectedSystems.map(system => <span>{system.name}</span>)
              }
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
        </div>
      </div>

      {props.children}

    </div>
  )
}
