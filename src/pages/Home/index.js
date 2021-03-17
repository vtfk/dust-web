import { useSession } from '@vtfk/react-msal'
import { useLocation, Link } from 'react-router-dom'
import {
  Heading2,
  Paragraph
} from '@vtfk/components'

import './styles.scss'
import { Layout } from '../../layout'

export const Home = () => {
  const { user, logout } = useSession()
  const location = useLocation()

  return (
    <Layout fullHeightHeader={true}></Layout>
  )
}
