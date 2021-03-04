import { useSession } from '@vtfk/react-msal'
import { Heading2 } from '@vtfk/components'

import './styles.scss'
import { Layout } from '../../layout'

export const Home = () => {
  const { user } = useSession()

  return (
    <Layout>
      <Heading2 as='h1'>{`Hei ${user.givenName} og velkommen til MinElev leder`}</Heading2>
    </Layout>
  )
}
