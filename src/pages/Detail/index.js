import React, { useState, useEffect } from 'react'
import { useSession } from '@vtfk/react-msal'
import { useParams } from 'react-router-dom'

import {
  Heading3,
  Heading4,
  Paragraph,
  Link,
  Skeleton,
  InitialsBadge,
  Icon,
  Spinner,
  Modal,
  ModalBody
} from '@vtfk/components'

import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { APP } from '../../config'

import systemsList from '../../data/systems.json'

import './styles.scss'
import { Layout } from '../../layout'

export const Detail = () => {
  const [loading, setLoading] = useState(true)
  const [expandedItemIndex, setExpandedItemIndex] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [results, setResults] = useState(null)
  const [user, setUser] = useState(null)
  const [systems, setSystems] = useState(null)
  const [rawDetails, setRawDetails] = useState(null)
  const [rawDetailsTitle, setRawDetailsTitle] = useState('Lukk')
  const { apiGet } = useSession()
  const { id } = useParams()

  useEffect(() => {
    // close modal on escape
    const handleKeyPress = event => {
      if (event.key === 'Escape') closeDetailModal()
    }

    document.addEventListener('keyup', handleKeyPress)
    return () => document.removeEventListener('keyup', handleKeyPress)
  }, [])
  
  useEffect(() => {
    async function getReport () {
      const { data, headers, status } = await apiGet(`${APP.API_URL}/report/${id}`, true)

      if (status === 200) {
        setLoading(false)
        normalizeAndSetResults(data.data)
        setUser(data.user)
      } else if (status === 202) {
        const retryMs = headers['retry-after']
        if (data.user) setUser(data.user)
        if (data.systems) setSystems(data.systems)
        setTimeout(getReport, retryMs)
      }
    }

    getReport()
    // eslint-disable-next-line
  }, [id]) // apiGet can't be set as a dependency because it changes with each render which will cause double or tripple calls to backend

  function normalizeAndSetResults (data) {
    const normalizedResults = []

    for (let i = 0; i < data.length; i++) {
      const normalizedItem = { ...data[i] }
      const errorTests = []
      let errorCount = 0
      const warningTests = []
      let warningCount = 0
      const okTests = []
      let okCount = 0

      for (let j = 0; j < normalizedItem.tests.length; j++) {
        if (!normalizedItem.tests[j].result || normalizedItem.tests[j].result.status === 'no-data' || normalizedItem.tests[j].result.message === 'Har data') continue

        if (normalizedItem.tests[j].result.status === 'error') {
          errorTests.push(normalizedItem.tests[j])
          errorCount++
        } else if (normalizedItem.tests[j].result.status === 'warning') {
          warningTests.push(normalizedItem.tests[j])
          warningCount++
        } else {
          okTests.push(normalizedItem.tests[j])
          okCount++
        }
      }

      normalizedItem.errorTests = errorTests
      normalizedItem.errorCount = errorCount
      normalizedItem.warningTests = warningTests
      normalizedItem.warningCount = warningCount
      normalizedItem.okTests = okTests
      normalizedItem.okCount = okCount

      normalizedResults.push(normalizedItem)
    }

    setResults(normalizedResults)
  }

  function expand (itemIndex) {
    if (!loading) {
      if (itemIndex === expandedItemIndex) {
        setExpandedItemIndex(null)
      } else {
        setExpandedItemIndex(itemIndex)
      }
    }
  }

  function openDetailModal (raw, description) {
    setRawDetails(JSON.stringify(raw, null, '  '))
    setRawDetailsTitle(description || 'Lukk')
    setModalOpen(true)
  }

  function closeDetailModal () {
    setModalOpen(false)
  }

  function repackSystemName (name) {
    const repack = systemsList.filter(system => system.short === name.toLowerCase())
    return repack.length > 0 ? repack[0].name : name.toUpperCase()
  }

  return (
    <Layout>
      <div className='detail'>
        <div className='container'>
          <div className='person-information'>
            <div className='image'>
              {
                !user
                  ? <Skeleton variant='circle'><InitialsBadge size='large' /></Skeleton>
                  : <InitialsBadge firstName={user.givenName} lastName={user.surName} size='large' />
              }
            </div>
            <div className='text-wrapper'>
              <Heading3 className='name'>
                {
                  !user
                    ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[50, 100]} />
                    : user.displayName
                }
              </Heading3>
              <Heading4>
                {
                  !user
                    ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[50, 100]} />
                    : user.userPrincipalName
                }
              </Heading4>
              <div className='other'>
                <Paragraph>
                  {!user ? <Skeleton style={{ marginBottom: 5 }} width='200px' /> : user.office}
                </Paragraph>
                <Paragraph>
                  {!user ? <Skeleton style={{ marginBottom: 5 }} width='180px' /> : user.samAccountName}
                </Paragraph>
              </div>
            </div>
          </div>

          <div className='result-table'>
            {
              loading && systems &&
                systems.map((system, index) => {
                  return (
                    <div key={index} className='result-table-row loading'>
                      <div className='result-table-row-summary'>
                        <div className='result-table-row-status '>
                          <Spinner size='auto' />
                        </div>
                        <div className='result-table-row-name'>
                          <div className='result-table-row-name-loading'>Henter status for {system}...</div>
                        </div>
                      </div>
                    </div>
                  )
                })
            }

            {
              !loading &&
              results &&
                <Heading3 className='result-title'>Status på data</Heading3>
            }

            {
              !loading &&
              results &&
              results.map((item, index) => {
                const open = expandedItemIndex === index

                return (
                  <div key={index} className={`result-table-row ${open ? 'open' : ''} ${loading ? 'loading' : ''}`}>
                    <div className='result-table-row-summary' onClick={() => { expand(index) }}>

                      <div className={`result-table-row-status ${item.errorCount > 0 ? 'error' : item.warningCount > 0 ? 'warning' : 'ok'}`}>
                        {item.errorCount === 0 && item.warningCount === 0 ? 'OK' : item.errorCount > 0 ? item.errorCount : item.warningCount}
                      </div>

                      <div className='result-table-row-name'>
                        {repackSystemName(item.name)}
                      </div>

                      <div className='result-table-row-toggle'>
                        <Icon name={open ? 'chevronUp' : 'chevronDown'} size='xsmall' />
                      </div>
                    </div>

                    {
                      open &&
                        <div className='result-table-row-detail'>
                          {
                            item.errorCount > 0 &&
                            item.errorTests.map((testItem, index) => {
                              return (
                                <div key={index} className='result-table-row-detail-error'>
                                  <Paragraph><strong>Feil</strong>: {testItem.result?.message || testItem.description}</Paragraph>
                                  {
                                    testItem.result?.raw &&
                                      <Link size='small' onClick={() => { openDetailModal(testItem.result.raw, testItem.description) }}>Se data</Link>
                                  }
                                </div>
                              )
                            })
                          }

                          {
                            item.warningCount > 0 &&
                            item.warningTests.map((testItem, index) => {
                              return (
                                <div key={index} className='result-table-row-detail-warning'>
                                  <Paragraph><strong>Advarsel</strong>: {testItem.result?.message || testItem.description}</Paragraph>
                                  {
                                    testItem.result?.raw &&
                                      <Link size='small' onClick={() => { openDetailModal(testItem.result.raw, testItem.description) }}>Se data</Link>
                                  }
                                </div>
                              )
                            })
                          }

                          {
                            item.okCount > 0 &&
                            item.okTests.map((testItem, index) => {
                              return (
                                <div key={index} className='result-table-row-detail-ok'>
                                  <Paragraph><strong>OK</strong>: {testItem.result?.message || testItem.description}</Paragraph>
                                  {
                                    testItem.result?.raw &&
                                    <Link size='small' onClick={() => { openDetailModal(testItem.result.raw, testItem.description) }}>Se data</Link>
                                  }
                                </div>
                              )
                            })
                          }

                          {
                            item.errorCount === 0 &&
                            item.warningCount === 0 &&
                            item.okCount === 0 &&
                              <div className='result table-row-detail-ok'>
                                <Paragraph>Alt ser bra ut, men det er ingen tester å vise.</Paragraph>
                              </div>
                          }

                          <div className='result-table-row-detail-raw'>
                            <Paragraph />
                            <Link size='small' onClick={() => { openDetailModal(item.data, repackSystemName(item.name)) }}>Se raw-data</Link>
                          </div>
                        </div>
                    }
                  </div>
                )
              })
            }
          </div>
        </div>

        <Modal
          open={modalOpen}
          title={rawDetailsTitle}
          onDismiss={() => { closeDetailModal() }}
          className='detail-modal'
        >
          <ModalBody>
            <SyntaxHighlighter language='json' className='detail-modal-code' style={docco} wrapLongLines wrapLines showInlineLineNumbers>
              {rawDetails}
            </SyntaxHighlighter>
          </ModalBody>
        </Modal>

      </div>
    </Layout>
  )
}
