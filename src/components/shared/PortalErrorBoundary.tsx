'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
  /** Portal name shown in the error message, e.g. "Baker Portal" */
  portalName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class PortalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO (Phase 1): forward to error tracking service (Sentry, etc.)
    console.error(`[${this.props.portalName ?? 'Portal'}] Unhandled error:`, error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              {this.props.portalName
                ? `The ${this.props.portalName} encountered an unexpected error.`
                : 'An unexpected error occurred.'}
            </p>
          </div>
          {this.state.error?.message && (
            <pre className="rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground overflow-x-auto">
              {this.state.error.message}
            </pre>
          )}
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }
}
