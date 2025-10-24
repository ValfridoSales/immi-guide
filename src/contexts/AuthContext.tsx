import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp: string | null;
  location: string | null;
  stripe_customer_id: string | null;
}

interface Subscription {
  id: string;
  plan_type: 'free' | 'pro';
  status: string;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  isPro: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing';

  const loadUserData = async (userId: string) => {
    try {
      // Carregar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Carregar assinatura
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (subError) throw subError;
      
      // Se não existe subscription, criar uma grátis
      if (!subData) {
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_type: 'free',
            status: 'inactive'
          })
          .select()
          .single();

        if (createError) throw createError;
        setSubscription(newSub as Subscription);
      } else {
        setSubscription(subData as Subscription);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus dados.',
        variant: 'destructive',
      });
    }
  };

  const refreshSubscription = useCallback(async () => {
    if (!user || !session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data) {
        // Update subscription state from Stripe
        const { data: updatedSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (updatedSub) {
          setSubscription(updatedSub as Subscription);
        }
      }
    } catch (error: any) {
      console.error('Erro ao verificar assinatura:', error);
    }
  }, [user, session]);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
      setIsLoading(false);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setProfile(null);
        setSubscription(null);
      }
      
      setIsLoading(false);
    });

    return () => authListener.unsubscribe();
  }, []);

  // Auto-refresh subscription periodically
  useEffect(() => {
    if (user && session) {
      // Initial check after login
      const timeout = setTimeout(() => {
        refreshSubscription();
      }, 2000);

      // Periodic refresh every 5 minutes
      const interval = setInterval(() => {
        refreshSubscription();
      }, 5 * 60 * 1000);

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [user, session, refreshSubscription]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Enhanced error messages
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
        }
        throw error;
      }

      toast({
        title: 'Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message || 'Não foi possível fazer login.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        // Enhanced error messages
        if (error.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Deseja fazer login?');
        }
        throw error;
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu email para confirmar sua conta antes de fazer login.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Não foi possível criar sua conta.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setProfile(null);
      setSubscription(null);
      
      toast({
        title: 'Até logo!',
        description: 'Você saiu da sua conta.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao sair',
        description: error.message || 'Não foi possível sair.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        subscription,
        isPro,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
