import React, { useState } from 'react'
import { useSession } from '@vtfk/react-msal'
import { useLocation, Link } from 'react-router-dom'
import { SideNav, SideNavItem, InitialsBadge, Paragraph, SkipLink, IconDropdownNav, IconDropdownNavItem, Icon, Logo } from '@vtfk/components'
import ScrollLock, { TouchScrollable } from 'react-scrolllock'

import { ROUTES } from '../config'

import './styles.scss'
import './base-styles.scss'

export function Layout (props) {
  const { user, logout } = useSession()
  const location = useLocation()
  const [openTopNavSide, setOpenTopNavSide] = useState(false)
  const [scrollLock, setScrollLock] = useState(false)

  function clickTopNavToggle () {
    const newIsOpen = !openTopNavSide
    setOpenTopNavSide(newIsOpen)

    if (newIsOpen && window.innerWidth <= 1000) {
      setScrollLock(true)
    } else {
      setScrollLock(false)
    }

    return newIsOpen
  }

  function clickContainer () {
    if (openTopNavSide) setOpenTopNavSide(false)
  }

  return (
    <div>
      <SkipLink href='#main-content'>Hopp til hovedinnhold</SkipLink>

      <div className='layout'>
        <SideNav title='DUST'>
          <SideNavItem icon={<Icon name='home' />} active={location.pathname === '/'} href='/' title='Forside' />
        </SideNav>

        <nav role='navigation' className={`topnav-side ${openTopNavSide ? 'open' : ''}`}>
          <div className='topnav-side-user'>
            <div className='user'>
              <InitialsBadge className='user-image' firstName={user.givenName} lastName={user.surname} />
              <div className='user-name'>
                <Paragraph>{user.displayName}</Paragraph>
              </div>
              <div className='user-menu'>
                <IconDropdownNav>
                  <IconDropdownNavItem onClick={() => logout()} title='Logg ut' />
                </IconDropdownNav>
              </div>
            </div>

            <button aria-label='Lukk meny' title='Lukk menyen' className='topnav-side-top-close' onClick={clickTopNavToggle}>
              <Icon name='close' size='xsmall' />
            </button>
          </div>

          <TouchScrollable>
            <div className='topnav-side-list'>
              <div className='topnav-side-list-inner'>
                <Link className={`topnav-side-list-item ${location.pathname === '/' ? 'active' : ''}`} to='/'>
                  <div className='topnav-side-list-item-icon'><Icon size='medium' name='home' /></div>
                  <div className='topnav-side-list-item-text'>Forside</div>
                </Link>
              </div>
            </div>
          </TouchScrollable>
        </nav>

        <div className='container' onClick={() => { clickContainer() }}>
          <header className='topnav'>
            <a href='/' className='topnav-brand'>
              <div className='brand-logo' aria-hidden>
                <Logo />
              </div>
              <div className='brand-name'>
                MinElev Leder
              </div>
            </a>
            <div className='topnav-toggles'>
              <button aria-label='Åpne meny' title='Åpne menyen' onClick={clickTopNavToggle}>
                <Icon size='small' name='menu' />
              </button>
            </div>
          </header>

          <div className='action-bar'>
            <div className='search'>
              {/*   <SearchField
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onSearch={() => { window.location.replace(`/${ROUTES.students}?s=${searchTerm || ''}`) }}
                placeholder='Søk etter elev ...'
                className='search-input'
                rounded
              /> */}
            </div>

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

          <ScrollLock isActive={scrollLock}>
            <div id='main-content' {...props}>
              {props.children}
            </div>
          </ScrollLock>
        </div>
      </div>
    </div>
  )
}
