import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          fontFamily: 'monospace',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h1>Application Error</h1>
          <p>{this.state.error?.message}</p>
          <p style={{ fontSize: '12px', whiteSpace: 'pre-wrap', textAlign: 'left', backgroundColor: '#fecaca', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {this.state.error?.stack}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
