import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useNavigationContext } from './NavigationContext'
import { Routes } from '../types'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='container has-text-centered'>
          <h1 className='title'>Something went wrong</h1>
          <p className='subtitle'>
            We're sorry, but there was an error loading this page.
          </p>
          <div className='buttons is-centered'>
            <button
              className='button is-primary'
              onClick={() => (window.location.href = Routes.Splash)}>
              Return to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />
}
