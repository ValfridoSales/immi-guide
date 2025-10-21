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
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Esqueceu a senha?{' '}
            <Link to="/auth/reset" className="text-primary hover:underline">
              Recuperar
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="signup">
          <SignupForm />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Termos de Uso
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-6 border-t border-border text-center">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Voltar para o início
        </Link>
      </div>
    </AuthLayout>
  );
}
