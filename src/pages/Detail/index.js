import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSession } from '@vtfk/react-msal'
import { useParams } from "react-router-dom"

import {
  Heading3,
  Heading4,
  Paragraph,
  Link,
  Skeleton,
  InitialsBadge,
  IconButtonLink,
  Icon,
  Spinner,
  Modal,
  ModalBody,
  ModalSideActions,
  Button
} from '@vtfk/components'

import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import { APP } from '../../config'

import './styles.scss'
import { Layout } from '../../layout'

export const Detail = () => {
  const [loading, setLoading] = useState(true)
  const [expandedItemIndex, setExpandedItemIndex] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [results, setResults] = useState(null)
  const [user, setUser] = useState(null)
  const [rawDetails, setRawDetails] = useState(null)
  const { token } = useSession()
  const { id } = useParams()
  const RETRY_MS = 3000

  useEffect(() => {
    getReport()
  }, [])

  async function getReport() {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`

    const result = await axios.get(`${APP.API_URL}/report/${id}`)
    console.log('result', result)
    console.log('user', result.data.user)

    if (result.status === 200) {
      setLoading(false)
      normalizeAndSetResults(result.data.data)
      setUser(result.data.user)
    } else if (result.status === 202) {
      setTimeout(function() {
        getReport()
      }, RETRY_MS)
    }
  }

  function normalizeAndSetResults(data) {
    let normalizedResults = []

    for (var i = 0; i < data.length; i++) {
      let normalizedItem = {...data[i]}
      let errorTests = []
      let errorCount = 0
      let warningTests = []
      let warningCount = 0
      let okTests = []
      let okCount = 0

      for (var j = 0; j < normalizedItem.tests.length; j++) {
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

    console.log('normalizedResults', normalizedResults)

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

  function openDetailModal(testItem) {
    setRawDetails(JSON.stringify(testItem.result.raw, null, "  "))
    setModalOpen(true)
  }

  console.log('results', results)

  return (
    <Layout>
      <div className='detail'>
        <div className='container'>
          <div className='person-information'>
            <div className='image'>
              {
                !user ||
                loading
                  ? <Skeleton variant='circle'><InitialsBadge size='large' /></Skeleton>
                  : <InitialsBadge firstName={user.givenName} lastName={user.surName} size='large' />
              }
            </div>
            <div className='text-wrapper'>
              <Heading3 className='name'>
                {
                  !user ||
                  loading
                    ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[50, 100]} />
                    : user.displayName
                }
              </Heading3>
              <Heading4>
                {
                  !user ||
                  loading
                    ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[50, 100]} />
                    : user.userPrincipalName
                }
              </Heading4>
              <div className='other'>
                <Paragraph>
                  {!user || loading ? <Skeleton style={{ marginBottom: 5 }} width='200px' /> : user.office}
                </Paragraph>
                <Paragraph>
                  {!user || loading ? <Skeleton style={{ marginBottom: 5 }} width='180px' /> : user.samAccountName}
                </Paragraph>
              </div>
            </div>
            <div className='person-information-actions'>
              {
                /*
                !loading &&
                  <IconButtonLink
                    className='person-information-action-button'
                    onClick={() => { window.alert('WIP') }}
                    icon='add'
                    type='transparent-bordered'
                  >
                    Generere rapport
                  </IconButtonLink>
                  */
              }
            </div>
          </div>

          <div className='result-table'>
            {
              loading &&
              <React.Fragment>
                <div className='result-table-row loading'>
                  <div className='result-table-row-summary'>
                    <div className='result-table-row-status '>
                      <Spinner size='auto' />
                    </div>
                    <div className='result-table-row-name'>
                      <div className='result-table-row-name-loading'>Henter status...</div>
                    </div>
                  </div>
                </div>
                <div className='result-table-row loading'>
                  <div className='result-table-row-summary'>
                    <div className='result-table-row-status '>
                      <Spinner size='auto' />
                    </div>
                    <div className='result-table-row-name'>
                      <div className='result-table-row-name-loading'>Henter status...</div>
                    </div>
                  </div>
                </div>
                <div className='result-table-row loading'>
                  <div className='result-table-row-summary'>
                    <div className='result-table-row-status '>
                      <Spinner size='auto' />
                    </div>
                    <div className='result-table-row-name'>
                      <div className='result-table-row-name-loading'>Henter status...</div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            }

            {
              !loading &&
              results &&
              <Heading3 className='result-title'>Status på data:</Heading3>
            }

            {
              !loading &&
              results &&
              results.map(function (item, index) {
                const open = expandedItemIndex === index

                return (
                  <div key={index} className={`result-table-row ${open ? 'open' : ''} ${loading ? 'loading' : ''}`}>
                    <div className='result-table-row-summary' onClick={() => { expand(index) }}>

                      <div className={`result-table-row-status ${item.errorCount > 0 ? 'error' : item.warningCount > 0 ? 'warning' : 'ok'}`}>
                        {item.errorCount === 0 && item.errorCount === 0 ? 'OK' : item.errorCount > 0 ? item.errorCount : item.warningCount}
                      </div>

                      <div className='result-table-row-name'>
                        {item.name.toUpperCase()}
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
                            item.errorTests.map(function(testItem) {
                              return (
                                <div className='result-table-row-detail-error'>
                                  <Paragraph><strong>Feil</strong>: {testItem.title}</Paragraph>
                                  {
                                    testItem.result?.raw &&
                                    <Link size='small' onClick={() => { openDetailModal(testItem) }}>Se data</Link>
                                  }
                                </div>
                              )
                            })
                          }

                          {
                            item.warningCount > 0 &&
                            item.warningTests.map(function(testItem) {
                              return (
                                <div className='result-table-row-detail-warning'>
                                  <Paragraph><strong>Advarsel</strong>: {testItem.title}</Paragraph>
                                  <Link size='small' onClick={() => { openDetailModal(testItem) }}>Se data</Link>
                                </div>
                              )
                            })
                          }

                          {
                            item.okCount > 0 &&
                            item.okTests.map(function(testItem) {
                              return (
                                <div className='result-table-row-detail-ok'>
                                  <Paragraph><strong>OK</strong>: {testItem.title}</Paragraph>
                                  <Link size='small' onClick={() => { openDetailModal(testItem) }}>Se data</Link>
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
          title='Lukk'
          onDismiss={() => { setModalOpen(false) }}
          className='detail-modal'
        >
          <ModalBody>
            <SyntaxHighlighter language='json' className='detail-modal-code' style={docco} wrapLongLines={true} wrapLines={true} showInlineLineNumbers={true}>
              {rawDetails}
            </SyntaxHighlighter>
          </ModalBody>
        </Modal>

      </div>
    </Layout>
  )
}
