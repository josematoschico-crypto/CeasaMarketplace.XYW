import * as React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      let isFirestoreError = false;

      try {
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error && parsed.operationType) {
          isFirestoreError = true;
          errorMessage = `Erro de Permissão (${parsed.operationType}): ${parsed.error}`;
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-[32px] shadow-xl p-8 text-center space-y-6 border border-slate-100">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">Ops! Algo deu errado</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                {isFirestoreError 
                  ? 'Parece que você não tem permissão para realizar esta ação ou acessar estes dados.'
                  : 'Não conseguimos processar sua solicitação no momento.'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-left">
              <p className="text-xs font-mono text-slate-600 break-words">
                {errorMessage}
              </p>
            </div>

            <Button 
              onClick={this.handleReset}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
