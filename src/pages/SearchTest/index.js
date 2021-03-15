import { useEffect, useState } from 'react'
import { useSession } from '@vtfk/react-msal'
import { SearchField } from '@vtfk/components'

import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import './styles.scss'

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
      <SyntaxHighlighter language='json' className='code' style={docco}>
        {JSON.stringify(searchResult, null, 2)}
      </SyntaxHighlighter>
    </div>
  )
}
