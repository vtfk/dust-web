import { useSession } from '@vtfk/react-msal'
import { SearchField } from '@vtfk/components'

import './styles.scss'
import { useEffect, useState } from 'react'
import { APP } from '../../config'

export const SearchTest = () => {
  const { apiGet } = useSession()
  const [query, setQuery] = useState('')
  const [searchResult, setSearchResult] = useState([])

  useEffect(() => {
    const search = async q => {
      const res = await apiGet(`${APP.API_URL}/search?q=${encodeURIComponent(q)}`)
      if (res.data) setSearchResult(res.data)
      console.log(res)
    }

    if (query) search(query)
  }, [query])

  return (
    <div className='search'>
      <SearchField
        onChange={e => setQuery(e.target.value)}
        value={query}
        rounded
      />
      <pre>
        {JSON.stringify(searchResult, null, 2)}
      </pre>
    </div>
  )
}
