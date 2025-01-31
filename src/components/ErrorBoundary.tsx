import { Component, ErrorInfo, ReactNode } from 'react'

import { addToast } from '~/core/apolloClient'

interface ErrorBoundaryProps {
  children: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  componentDidCatch(error: { message: string; name: string }, errorInfo: ErrorInfo) {
    addToast({
      severity: 'danger',
      translateKey: 'text_622f7a3dc32ce100c46a5154',
    })
  }

  render() {
    return <>{this?.props?.children}</>
  }
}
