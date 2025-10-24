import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordInput } from './PasswordInput';
import { Loader2, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            placeholder="Digite seu email"
            className="h-12"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive animate-fade-in">{errors.email.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Continuando...
            </>
          ) : (
            'Continuar com email'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link 
          to="/auth/reset" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Esqueceu sua senha?
        </Link>
      </div>
    </div>
  );
}
