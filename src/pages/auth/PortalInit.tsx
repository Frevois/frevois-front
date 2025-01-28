import { useEffect } from 'react'
import { useParams } from 'react-router'

import { onAccessCustomerPortal } from '~/core/apolloClient'

import CustomerPortal from '../customerPortal/CustomerPortal'

const PortalInit = () => {
  const { token } = useParams()

  useEffect(() => {
    if (token) {
      onAccessCustomerPortal(token)
    }
  }, [token])

  return <CustomerPortal />
}

export default PortalInit
