import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordInput } from './PasswordInput';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { Loader2, Mail, User, Lock } from 'lucide-react';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      navigate('/auth');
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
            id="fullName"
            type="text"
            placeholder="Nome completo"
            className="h-12"
            {...register('fullName')}
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive animate-fade-in">{errors.fullName.message}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <PasswordInput
            id="password"
            placeholder="Crie uma senha forte"
            className="h-12"
            {...register('password')}
            disabled={isLoading}
            error={!!errors.password}
          />
          {errors.password && (
            <p className="text-sm text-destructive animate-fade-in">{errors.password.message}</p>
          )}
          
          {passwordValue && (
            <PasswordStrengthIndicator password={passwordValue} />
          )}
        </div>

        <div className="space-y-2">
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirme sua senha"
            className="h-12"
            {...register('confirmPassword')}
            disabled={isLoading}
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive animate-fade-in">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 mt-6" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>
    </div>
  );
}
