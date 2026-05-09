import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Text, View } from 'react-native'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <View className="flex-1 bg-background items-center justify-center px-8">
          <Text className="text-2xl font-bold text-primary mb-2">Algo ha ido mal</Text>
          <Text className="text-muted text-center text-sm mb-6">
            Ha ocurrido un error inesperado. Puedes intentar reinar.
          </Text>
          {this.state.error && (
            <View className="bg-borderSoft rounded-xl px-4 py-3 mb-6 w-full">
              <Text className="text-xs text-muted font-mono" numberOfLines={4}>
                {this.state.error.message}
              </Text>
            </View>
          )}
        </View>
      )
    }

    return this.props.children
  }
}
