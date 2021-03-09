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
  SkipLink,
} from '@vtfk/components'
import ScrollLock, { TouchScrollable } from 'react-scrolllock'

import { ROUTES } from '../config'

import systems from '../data/systems.json'

import './styles.scss'
import './base-styles.scss'

export function Layout (props) {
  const { user, logout } = useSession()
  const location = useLocation()

  return (
    <div className="layout">
      <SkipLink href='#main-content'>Hopp til hovedinnhold</SkipLink>

      <div className="header">
        <div className="topnav">
          <div className="container">
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

        <div className="container">
          <Heading2 as="h1" className="header-title">Debug User Status Tool</Heading2>
          <Paragraph className="header-description">Et verktøy hvor du kan søke på navn, brukernavn, e-post eller personnummer.  Verktøyet søker i mange datakilder, og returnerer debuginfo og en visuell representasjon av feilsituasjoner.</Paragraph>
          <div className="header-search-text">
            <SearchField
              placeholder='Søk på navn, brukernavn, e-post eller personnummer..'
              value=''
              onSearch={() => console.log('onSearch!')}
              rounded
            />
          </div>
          <div className="header-search-type">
            <RadioButton name='name' value='value-1' label='Søk blant elever' onChange={(e) => { console.log(e.target.value) }} />
            <RadioButton name='name' value='value-2' label='Søk blant ansatte' onChange={(e) => { console.log(e.target.value) }} />
            <RadioButton name='name' value='value-3' label='Søk i alt' onChange={(e) => { console.log(e.target.value) }} />
          </div>
          <div className="header-search-locations">
            <Paragraph size="small">
              <strong>Søker i basene:</strong>
              {
                systems.map(system => <span>{system.name}</span>)
              }
            </Paragraph>
            <button onClick={() => { alert('WIP') }} className="header-search-locations-toggle">
              <Icon name='chevronDown' size="xsmall" />
            </button>
          </div>
        </div>
      </div>

      {props.children}

    </div>
  )
}
