import React from 'react'
import { getConfig } from '../../../scripts/storybook/storyConfig'

import { SearchField } from '.'

export default getConfig(
  { title: 'SearchField', component: SearchField }
)

export function Basic () {
  return (
    <SearchField
      placeholder='Dette er placeholderen'
      value=''
      onSearch={() => console.log('onSearch!')}
      rounded
    />
  )
}
