import { useState } from 'react'
import { useSession } from '@vtfk/react-msal'
import { useLocation, useParams } from 'react-router-dom'
import {
  Heading2,
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
  Button,
} from '@vtfk/components'

import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'

import './styles.scss'
import { Layout } from '../../layout'

export const Detail = () => {
  const { user, logout } = useSession()
  const location = useLocation()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [expandedItemIndex, setExpandedItemIndex] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const results = [
    { label: 'Visma', errorCount: 0 },
    { label: 'Extens', errorCount: 2 },
    { label: 'AD', errorCount: 0 },
    { label: 'Azure', errorCount: 0 },
    { label: 'SDS Teams', errorCount: 4 },
    { label: 'FEIDE', errorCount: 0 }
  ]

  const jsonError = `{
    "data": [{
      "type": "articles",
      "id": "1",
      "attributes": {
        "title": "JSON:API paints my bikeshed!",
        "body": "The shortest article. Ever.",
        "created": "2015-05-22T14:56:29.000Z",
        "updated": "2015-05-22T14:56:28.000Z"
      },
      "relationships": {
        "author": {
          "data": {"id": "42", "type": "people"}
        }
      }
    }],
    "included": [
      {
        "type": "people",
        "id": "42",
        "attributes": {
          "name": "John",
          "age": 80,
          "gender": "male"
        }
      }
    ]
  }`

  function expand(itemIndex) {
    if (!loading) {
      if (itemIndex === expandedItemIndex) {
        setExpandedItemIndex(null)
      } else {
        setExpandedItemIndex(itemIndex)
      }
    }
  }

  return (
    <Layout>
      <div className="detail">
        <div className="container">
          <div className='person-information'>
            <div className='image'>
              {
                loading
                  ? <Skeleton variant='circle'><InitialsBadge size='large' /></Skeleton>
                  : <InitialsBadge firstName={'Fornavn'} lastName={'Etternavn'} size='large' />
              }
            </div>
            <div className='text-wrapper'>
              <Heading3 className='name'>
                {
                  loading
                    ? <Skeleton style={{marginBottom: 5}} randomWidth={[50, 100]} />
                    : `Fornavn Etternavn`
                }
              </Heading3>
              <Heading4>
                {
                  loading
                    ? <Skeleton style={{marginBottom: 5}} randomWidth={[50, 100]} />
                    : `05.09.2002`
                }
              </Heading4>
              <div className='other'>
                <Paragraph>
                  {loading ? <Skeleton style={{marginBottom: 5}} width='200px' /> : 'Navn på skole'}
                </Paragraph>
                <Paragraph>
                  {loading ? <Skeleton style={{marginBottom: 5}} width='180px' /> : 'epost@epost.no'}
                </Paragraph>
              </div>
            </div>
            <div className='person-information-actions'>
              {
                !loading &&
                <IconButtonLink
                    className='person-information-action-button'
                    onClick={() => { alert('WIP') }}
                    icon='add'
                    type='transparent-bordered'
                >
                  Generere rapport
                </IconButtonLink>
              }
            </div>
          </div>

          <div className="result-table">
            <Heading3 className="result-title">Status på data:</Heading3>

            {
              results.map(function(item, index) {
                const open = expandedItemIndex === index

                return (
                  <>
                    <div onClick={() => { expand(index) }} className={`result-table-row ${open ? 'open' : '' } ${loading ? 'loading' : '' }`}>
                      <div className="result-table-row-summary">
                        {
                          loading ?
                          <div className={`result-table-row-status ${ loading ? '' : item.errorCount > 0 ? 'error' : 'ok' }`}>
                            <Spinner size='auto' />
                          </div>
                          :
                          <div className={`result-table-row-status ${ item.errorCount === 0 ? 'ok' : 'error' }`}>
                            { item.errorCount === 0 ? 'OK' : item.errorCount }
                          </div>
                        }
                        <div className="result-table-row-name">
                          { item.label }
                          { loading && <div className="result-table-row-name-loading">Henter status...</div> }
                        </div>
                        {
                          !loading &&
                          <div className="result-table-row-toggle">
                            <Icon name={open ? 'chevronUp' : 'chevronDown'} size="xsmall" />
                          </div>
                        }
                      </div>
                      {
                        open &&
                        <>
                          {
                            item.errorCount === 0 &&
                            <div className="result-table-row-detail">
                              <div className="result table-row-detail-ok">
                                <Paragraph>Alt ser bra ut!</Paragraph>
                              </div>
                            </div>
                          }
                          {
                            item.errorCount > 0 &&
                            <div className="result-table-row-detail">
                              <div className="result-table-row-detail-error">
                                <Paragraph>Lorem ipsum dolor sit amet, consectetur adipisicing elit. In numquam, vitae nobis qui velit harum atque reprehenderit provident magnam dicta?</Paragraph>
                                <Link size="small" onClick={() => { setModalOpen(true) }}>Se full rapport</Link>
                              </div>
                              <div className="result-table-row-detail-error">
                                <Paragraph>Lorem ipsum dolor sit amet, consectetur adipisicing elit. In numquam, vitae nobis qui velit harum atque reprehenderit provident magnam dicta?</Paragraph>
                                <Link size="small" onClick={() => { setModalOpen(true) }}>Se full rapport</Link>
                              </div>
                            </div>
                          }
                        </>
                      }
                    </div>
                  </>
                )
              })
            }
          </div>
        </div>

        <Modal
          open={modalOpen}
          title='Lukk'
          onDismiss={() => { setModalOpen(false) }}
          className="error-modal"
        >
          <ModalBody>
            <SyntaxHighlighter language="json" className="error-modal-code" style={docco}>
              {jsonError}
            </SyntaxHighlighter>
          </ModalBody>
          <ModalSideActions>
            <div className='action'>
              <Button onClick={() => { alert('WIP') }} type='primary'>Generer rapport</Button>
            </div>
            <div className='action'>
              <Link onClick={() => setModalOpen(false)}>Lukk</Link>
            </div>
          </ModalSideActions>
        </Modal>

      </div>
    </Layout>
  )
}
