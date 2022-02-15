import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { useDebouncedCallback } from 'use-debounce'

import './styles.scss'

import { Icon, TextField } from '@vtfk/components'

export function SearchField ({ placeholder, value, debounceMs, onPreDebounce, onDebounce, rounded, onSearch, onChange, className, ...props }) {
  const [searchValue, setSearchValue] = useState(value || '')
  const debouncer = useDebouncedCallback(event => {
    if (onDebounce && typeof onDebounce === 'function') onDebounce(event)
  }, debounceMs)

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') search()
  }

  const handleChange = (event) => {
    setSearchValue(event.target.value)
    debouncer(event)
    if (onPreDebounce && typeof onPreDebounce === 'function') onPreDebounce(event)
    if (onChange && typeof onChange === 'function') onChange(event)
  }

  const search = () => {
    if (onSearch && typeof onSearch === 'function') onSearch(searchValue)
  }

  return (
    <div className={`search-field ${rounded ? 'rounded' : ''}`}>
      <TextField
        value={searchValue}
        className={`${className || ''}`}
        rounded={rounded}
        placeholder={placeholder || 'Søk...'}
        label={rounded ? null : placeholder}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        {...props}
      />

      <div className='icon' onClick={search}>
        <Icon name='search' alt='' />
      </div>
    </div>
  )
}

SearchField.propTypes = {
  className: PropTypes.string,
  debounceMs: PropTypes.number,
  onChange: PropTypes.func,
  onDebounce: PropTypes.func,
  onPreDebounce: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  rounded: PropTypes.bool,
  value: PropTypes.string
}

SearchField.defaultProps = {
  debounceMs: 0
}
