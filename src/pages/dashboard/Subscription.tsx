import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Sparkles, CreditCard, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Subscription() {
  const { subscription, isPro, session } = useAuth();
  const { toast } = useToast();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível abrir o portal de gerenciamento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Assinatura</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu plano e pagamentos
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>
                  {isPro ? 'Você tem acesso completo ao Plano Pro' : 'Você está no Plano Grátis'}
                </CardDescription>
              </div>
              {isPro ? (
                <Badge className="bg-gradient-canadian border-0 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              ) : (
                <Badge variant="outline">Grátis</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPro ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {subscription?.status === 'trialing' ? 'Em período de teste' : 'Ativo'}
                      </p>
                    </div>
                  </div>

                  {subscription?.current_period_end && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Próxima cobrança</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {subscription?.trial_end && new Date(subscription.trial_end) > new Date() && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Seu período de teste grátis termina em{' '}
                      <strong>{new Date(subscription.trial_end).toLocaleDateString('pt-BR')}</strong>.
                      Após isso, você será cobrado R$ 19,90/mês.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleManageSubscription}
                    disabled={isLoadingPortal}
                  >
                    {isLoadingPortal ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Gerenciar Pagamento
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Atualize seu método de pagamento ou cancele sua assinatura
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Você está atualmente no plano gratuito. Faça upgrade para desbloquear todos os recursos premium.
                </p>
                <Button asChild className="bg-gradient-canadian border-0">
                  <Link to="/pricing">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Fazer Upgrade - 7 Dias Grátis
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos do Plano Pro</CardTitle>
            <CardDescription>
              Veja tudo o que você tem acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-canadian" />
                <span className="text-sm">Histórico completo da pontuação CRS</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-canadian" />
                <span className="text-sm">Simulações ilimitadas de cenários</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-canadian" />
                <span className="text-sm">Alertas automáticos de novos draws</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-canadian" />
                <span className="text-sm">Relatórios PDF detalhados e ilimitados</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-canadian" />
                <span className="text-sm">Suporte prioritário via WhatsApp</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
