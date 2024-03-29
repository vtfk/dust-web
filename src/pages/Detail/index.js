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

import ReactJson from 'react-json-view'

import { APP } from '../../config'

import systemsList from '../../data/systems.json'

import maskData from '../../lib/mask-data'

import './styles.scss'
import { Layout } from '../../layout'

export const Detail = () => {
  const [loading, setLoading] = useState(true)
  const [expandedItemIndex, setExpandedItemIndex] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [solutionModalOpen, setSolutionModalOpen] = useState(false)
  const [solutionMessage, setSolutionMessage] = useState(null)
  const [solutionData, setSolutionData] = useState(null)
  const [solutionTitle, setSolutionTitle] = useState(null)
  const [resultError, setResultError] = useState(null)
  const [results, setResults] = useState(null)
  const [user, setUser] = useState(null)
  const [systems, setSystems] = useState(null)
  const [rawDetails, setRawDetails] = useState(null)
  const [rawDetailsTitle, setRawDetailsTitle] = useState('Lukk')
  const { apiGet } = useSession()
  const { id } = useParams()

  const callFailed = (data, headers, status) => data === undefined && headers === undefined && status === undefined
  const isUserEmpty = user => user && typeof user === 'object' && Object.getOwnPropertyNames(user).length === 2
  const isDataEmpty = data => data && data.filter(system => system.data && system.data.length > 0).length === 0
  const callHasNoData = (user, data) => isUserEmpty(user) && isDataEmpty(data)

  useEffect(() => {
    // close modal on escape
    const handleKeyPress = event => {
      if (event.key === 'Escape') {
        closeDetailModal()
        closeSolutionModal()
      }
    }

    document.addEventListener('keyup', handleKeyPress)
    return () => document.removeEventListener('keyup', handleKeyPress)
  }, [])

  useEffect(() => {
    async function getReport () {
      const { data, headers, status } = await apiGet(`${APP.API_URL}/report/${id}`, true)
      maskData(data, {
        ssn: {
          char: '*'
        }
      })

      if (callFailed(data, headers, status) || callHasNoData(data?.user, data?.data)) {
        // something went wrong
        setLoading(false)
        setResultError(isUserEmpty(data?.user) ? 'Bruker ikke funnet' : isDataEmpty(data?.data) ? 'Brukerdata ikke funnet' : 'Noe gikk galt')
        setResults(null)
        setUser(!data || !data.user || isUserEmpty(data.user)
          ? {
              givenName: 'Not',
              surName: 'Available',
              displayName: data?.user?.displayName || 'Ikke tilgjengelig',
              userPrincipalName: data?.user?.userPrincipalName || 'ikke.tilgjengelig@vtfk.no',
              samAccountName: data?.user?.samAccountName || 'ikk4242',
              office: 'Syndebukk'
            }
          : data.user)
      } else if (status === 200) {
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

  function sortSystems (systems) {
    return systems.sort((a, b) => {
      const dnA = systemsList.filter(system => system.short === a.name)[0] || a
      const dnB = systemsList.filter(system => system.short === b.name)[0] || b
      const a1 = dnA.name[0].toLowerCase()
      const a2 = dnA.name[1].toLowerCase()
      const b1 = dnB.name[0].toLowerCase()
      const b2 = dnB.name[1].toLowerCase()
      if (a1 < b1) return -1
      if (a1 > b1) return 1
      if (a1 === b1) {
        if (a2 < b2) return -1
        if (a2 > b2) return 1
      }
      return 0
    })
  }

  function normalizeAndSetResults (data) {
    const normalizedResults = []
    data = sortSystems(data)

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

      // sometimes we want to hide certain systems from beeing presented
      const hasDataTest = normalizedItem.tests.find(test => test.title === 'Har data')
      if (hasDataTest && hasDataTest.result && hasDataTest.result.message === 'Bruker har ikke data i dette systemet') {
        normalizedItem.data = []
      }

      if (errorCount === 0 && warningCount === 0 && okCount === 0 && normalizedItem.error && typeof normalizedItem.error === 'object') {
        // This result has no tests and no data but it has an error. Increment the errorCount to flag that there are one error here
        errorCount++
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

  function openSolutionModal (message, solution, description) {
    setSolutionMessage(message)
    setSolutionData(solution)
    setSolutionTitle(description)
    setSolutionModalOpen(true)
  }

  function openDetailModal (raw, description) {
    setRawDetails(raw)
    setRawDetailsTitle(description || 'Lukk')
    setModalOpen(true)
  }

  function closeDetailModal () {
    setModalOpen(false)
    setRawDetails(null)
    setRawDetailsTitle('Lukk')
  }

  function closeSolutionModal () {
    setSolutionModalOpen(false)
    setSolutionMessage(null)
    setSolutionData(null)
    setSolutionTitle(null)
  }

  function getOffice () {
    if (user.domain && user.domain === 'login' && user.state) return `${user.state} - ${user.office || 'Mangler office 😬'}`
    else if (user.domain && user.domain === 'skole' && user.departmentShort && user.departmentShort.includes(':')) return `${user.departmentShort.split(':')[1]} - ${user.office || 'Mangler office 😬'}`
    return user.office || 'Mangler office 😬'
  }

  function getTitle () {
    if (!user.domain) return ''
    if (user.domain === 'login') return user.title || 'Mangler title 😬' // employee
    if (user.domain === 'skole' && user.title) return user.title || 'Mangler title 😬' // apprentice, OT or student
    return ''
  }

  function repackSystemName (name) {
    const repack = systemsList.filter(system => system.short === name.toLowerCase())
    return repack.length > 0 ? repack[0].name : name.toUpperCase()
  }

  function shouldShowRawData (data) {
    return (Array.isArray(data) && data.length > 0) || Object.getOwnPropertyNames(data).filter(prop => prop !== 'length').length > 0
  }

  return (
    <Layout>
      <div className='detail'>
        <div className='container'>
          <div className='person-information'>
            <div className='image'>
              {
                !user
                  ? <Skeleton variant='circle' randomWidth={[100, 100]}><InitialsBadge size='large' firstName='' lastName='' /></Skeleton>
                  : <InitialsBadge firstName={user.givenName} lastName={user.surName} size='large' />
              }
            </div>
            <div className='text-wrapper'>
              <Heading3 className='name'>
                {
                  !user
                    ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[25, 50]} />
                    : user.displayName
                }
              </Heading3>
              <Heading4>
                {
                  !user
                    ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[25, 50]} />
                    : user.userPrincipalName
                }
              </Heading4>
              <div className='other'>
                <Paragraph>
                  {
                    !user
                      ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[20, 40]} />
                      : user.samAccountName
                  }
                </Paragraph>
                <Paragraph>
                  {
                    !user
                      ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[25, 50]} />
                      : getOffice()
                  }
                </Paragraph>
                <Paragraph>
                  {
                    !user
                      ? <Skeleton style={{ marginBottom: 5 }} randomWidth={[20, 40]} />
                      : getTitle()
                  }
                </Paragraph>
              </div>
            </div>
          </div>

          {
            !loading &&
            results &&
            user &&
            user.initialExpectedType &&
              <Heading3 className='result-title'>
                <span>
                  Søk utført blant {user.initialExpectedType === 'employee' ? 'ansatte' : 'elever'}, men funnet som en {user.expectedType === 'employee' ? 'ansatt' : 'elev'}
                </span>
              </Heading3>
          }

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
                          <div className='result-table-row-name-loading'>Henter status for {repackSystemName(system)}...</div>
                        </div>
                      </div>
                    </div>
                  )
                })
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
                            item.error &&
                              <div className='result-table-row-detail-error'>
                                <Paragraph><strong>Feil</strong>: {item.error.error || item.error}</Paragraph>
                              </div>
                          }

                          {
                            item.data &&
                            item.errorCount > 0 &&
                            item.errorTests.map((testItem, index) => {
                              const errorMessage = testItem.result?.message || testItem.description
                              return (
                                <div key={index} className='result-table-row-detail-error'>
                                  <Paragraph>
                                    {
                                      testItem.result.solution
                                        ? <Link className='result-table-row-detail-solution-link' onClick={() => { openSolutionModal(errorMessage, testItem.result.solution, testItem.description) }}><strong>Feil</strong>: {errorMessage}</Link>
                                        : <span><strong>Feil</strong>: {errorMessage}</span>
                                    }
                                  </Paragraph>
                                  {
                                    testItem.result?.raw &&
                                      <Link size='small' onClick={() => { openDetailModal(testItem.result.raw, testItem.description) }}>Se data</Link>
                                  }
                                </div>
                              )
                            })
                          }

                          {
                            item.data &&
                            item.warningCount > 0 &&
                            item.warningTests.map((testItem, index) => {
                              const warningMessage = testItem.result?.message || testItem.description
                              return (
                                <div key={index} className='result-table-row-detail-warning'>
                                  <Paragraph>
                                    {
                                      testItem.result.solution
                                        ? <Link className='result-table-row-detail-solution-link' onClick={() => { openSolutionModal(warningMessage, testItem.result.solution, testItem.description) }}><strong>Advarsel</strong>: {warningMessage}</Link>
                                        : <span><strong>Advarsel</strong>: {warningMessage}</span>
                                    }
                                  </Paragraph>
                                  {
                                    testItem.result?.raw &&
                                      <Link size='small' onClick={() => { openDetailModal(testItem.result.raw, testItem.description) }}>Se data</Link>
                                  }
                                </div>
                              )
                            })
                          }

                          {
                            item.data &&
                            item.okCount > 0 &&
                            item.okTests.map((testItem, index) => {
                              const infoMessage = testItem.result?.message || testItem.description
                              return (
                                <div key={index} className='result-table-row-detail-ok'>
                                  <Paragraph>
                                    {
                                      testItem.result.solution
                                        ? <Link className='result-table-row-detail-solution-link' onClick={() => { openSolutionModal(infoMessage, testItem.result.solution, testItem.description) }}><strong>OK</strong>: {infoMessage}</Link>
                                        : <span><strong>OK</strong>: {infoMessage}</span>
                                    }
                                  </Paragraph>
                                  {
                                    testItem.result?.raw &&
                                      <Link size='small' onClick={() => { openDetailModal(testItem.result.raw, testItem.description) }}>Se data</Link>
                                  }
                                </div>
                              )
                            })
                          }

                          {
                            item.data &&
                            item.errorCount === 0 &&
                            item.warningCount === 0 &&
                            item.okCount === 0 &&
                              <div className='result table-row-detail-ok'>
                                <Paragraph>Alt ser bra ut, men det er ingen tester å vise.</Paragraph>
                              </div>
                          }

                          {
                            item.data &&
                            shouldShowRawData(item.data) &&
                              <div className='result-table-row-detail-raw'>
                                <Paragraph />
                                <Link size='small' onClick={() => { openDetailModal(item.data, `${repackSystemName(item.name)} raw-data`) }}>Se raw-data</Link>
                              </div>
                          }
                        </div>
                    }
                  </div>
                )
              })
            }

            {
              !loading &&
              !results &&
              resultError &&
                <Heading3>{resultError}</Heading3>
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
            <ReactJson
              collapsed={false}
              collapseStringsAfterLength={false}
              displayDataTypes={false}
              displayObjectSize={false}
              enableAdd={false}
              enableClipboard
              enableDelete={false}
              enableEdit={false}
              iconStyle='square'
              indentWidth={4}
              name={null}
              src={rawDetails}
              theme='summerfruit:inverted' // all themes can be seen here: https://mac-s-g.github.io/react-json-view/demo/dist/
            />
          </ModalBody>
        </Modal>

        <Modal
          open={solutionModalOpen}
          title={solutionTitle}
          onDismiss={() => { closeSolutionModal() }}
          className='solution-modal'
        >
          <ModalBody>
            <Heading3>Resultat</Heading3>
            <Paragraph>{solutionMessage}</Paragraph>
            <Heading3><strong>Løsningsforlag</strong></Heading3>
            {solutionData}
          </ModalBody>
        </Modal>

      </div>
    </Layout>
  )
}
