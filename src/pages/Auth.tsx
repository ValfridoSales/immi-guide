import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <AuthLayout
      title={mode === 'login' ? 'Impossível? Possível.' : 'Comece sua jornada'}
      subtitle={mode === 'login' ? 'Transforme seu sonho canadense em realidade' : 'Crie sua conta e acesse todas as ferramentas'}
    >
      {mode === 'login' ? (
        <>
          <LoginForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-primary hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </div>
        </>
      ) : (
        <>
          <SignupForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-primary hover:underline font-medium"
            >
              Fazer login
            </button>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Termos de Uso
            </Link>
            {' '}e{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
