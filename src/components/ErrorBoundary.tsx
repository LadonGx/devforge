import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** quando muda (ex.: rota), limpa o erro e tenta renderizar de novo */
  resetKey?: string
}

interface State {
  error: Error | null
}

/** Evita a tela em branco: se um componente quebrar, mostra o erro em vez de derrubar o app inteiro. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  componentDidCatch(error: Error) {
    console.error('[DevForge] erro na interface:', error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="empty-state">
        <h2>Algo quebrou nesta tela</h2>
        <pre className="err-box" style={{ textAlign: 'left', maxWidth: 720, margin: '16px auto' }}>
          {this.state.error.name}: {this.state.error.message}
        </pre>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={() => this.setState({ error: null })}>
            Tentar de novo
          </button>
          <a className="btn" href="#/">
            Voltar para a vitrine
          </a>
        </div>
      </div>
    )
  }
}
