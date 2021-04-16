import React from 'react'

import './styles.scss'
import { Layout } from '../../layout'

import { Heading2, Heading3, Paragraph, Heading4 } from '@vtfk/components'

const QuestionBlock = ({ question, children }) => {
  return (
    <div class='help-question-block'>
      <Heading4 className='help-section-question'>
        {question}
      </Heading4>

      <Paragraph className='help-text-block'>
        {children}
      </Paragraph>
    </div>
  )
}

export function Help () {
  return (
    <Layout>
      <div className='help'>

        <Heading2 as='h1' className='page-title'>
          Hjelpeside
        </Heading2>

        <Heading3 as='h2' className='help-section-title'>
          Begrepsforklaringer
        </Heading3>

        <QuestionBlock question='UPN (UserPrincipalName)'>
          Adressen du logger deg på Office 365 med. Dette skal også være likt som e-postadressen<br />
          Eksempel: <code>bjarne.betjent@vtfk.no</code>
        </QuestionBlock>

        <QuestionBlock question='SamAccountName'>
          Brukernavnet ditt (kortversjonen).<br />
          Eksempel: <code>bja0101</code>
        </QuestionBlock>

        <QuestionBlock question='UID'>
          FEIDE-brukernavn<br />
          Eksempel: <code>bja0101</code>
        </QuestionBlock>

        <QuestionBlock question='PrincipalName'>
          Fullt FEIDE-navn<br />
          Eksempel: <code>bja0101@vtfk.no</code>
        </QuestionBlock>

        <QuestionBlock question='MFA'>
          Multi Factor Authentication (2faktor i Azure)
        </QuestionBlock>

        <QuestionBlock question='OU (OrganizationalUnit)'>
          Mappestruktur i Active Directory
        </QuestionBlock>

      </div>
    </Layout>
  )
}
