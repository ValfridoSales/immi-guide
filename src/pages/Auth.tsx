import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <AuthLayout
      title={activeTab === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
      subtitle={
        activeTab === 'login'
          ? 'Entre para acessar suas ferramentas premium'
          : 'Comece sua jornada para o Canadá'
      }
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm />
        </TabsContent>

        <TabsContent value="signup">
          <SignupForm />
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Termos de Uso
            </Link>
            {' '}e{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}
