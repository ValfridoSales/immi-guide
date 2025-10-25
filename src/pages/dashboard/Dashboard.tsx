import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Bell, 
  FileText, 
  Sparkles,
  Calculator,
  CalendarDays
} from 'lucide-react';

export default function Dashboard() {
  const { profile, subscription, isPro } = useAuth();
  const [latestCRS, setLatestCRS] = useState<number | null>(null);
  const [isLoadingCRS, setIsLoadingCRS] = useState(true);
  const [latestDraw, setLatestDraw] = useState<any | null>(null);
  const [isLoadingDraw, setIsLoadingDraw] = useState(true);

  useEffect(() => {
    const fetchLatestCRS = async () => {
      if (!isPro || !profile?.id) {
        setIsLoadingCRS(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('crs_calculations')
          .select('total_score, created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setLatestCRS(data.total_score);
        }
      } catch (error) {
        console.error('Erro ao buscar CRS:', error);
      } finally {
        setIsLoadingCRS(false);
      }
    };

    fetchLatestCRS();
  }, [isPro, profile?.id]);

  useEffect(() => {
    const fetchLatestDraw = async () => {
      try {
        const { data, error } = await supabase
          .from('express_entry_draws')
          .select('date, type, category, invitations, crs_min')
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setLatestDraw(data);
        }
      } catch (error) {
        console.error('Erro ao buscar último draw:', error);
      } finally {
        setIsLoadingDraw(false);
      }
    };

    fetchLatestDraw();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            Olá, {profile?.full_name || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu dashboard de imigração para o Canadá
          </p>
        </div>

        {/* Cards de Informação */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Card CRS - apenas para premium */}
          {isPro && (
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground text-center">
                  Seu CRS Mais Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 pt-1">
                {isLoadingCRS ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : latestCRS ? (
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{latestCRS}</p>
                    <p className="text-xs text-muted-foreground mt-1">pontos</p>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground">
                      Nenhum cálculo ainda
                    </p>
                    <Button variant="link" size="sm" asChild className="mt-1 p-0 h-auto text-xs">
                      <Link to="/crs-calculator">Calcular agora</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card Último Draw */}
          <Card className={`border-primary/20 bg-gradient-to-br from-card to-primary/5 ${isPro ? 'md:col-span-2' : 'md:col-span-3'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Último Sorteio Express Entry
                </CardTitle>
                {!isLoadingDraw && latestDraw && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(latestDraw.date).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {isLoadingDraw ? (
                <div className="flex items-center justify-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : latestDraw ? (
                <div className="space-y-2">
                  <div className="text-center pb-2 border-b border-border/50">
                    <span className="text-base font-bold">{latestDraw.category || latestDraw.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">CRS Mínimo:</span>
                    <span className="text-2xl font-bold text-primary">{latestDraw.crs_min}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">ITAs:</span>
                    <span className="text-lg font-semibold">{latestDraw.invitations.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum sorteio disponível
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Card */}
        <Card className={isPro ? 'border-primary bg-gradient-to-br from-card to-primary/5' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status da Assinatura</CardTitle>
                <CardDescription>
                  {isPro ? 'Você tem acesso a todas as features premium' : 'Faça upgrade para desbloquear recursos premium'}
                </CardDescription>
              </div>
              {isPro ? (
                <Badge className="bg-gradient-canadian border-0 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Plano Pro
                </Badge>
              ) : (
                <Badge variant="outline">Plano Grátis</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isPro ? (
              <div className="space-y-2">
                <p className="text-sm">
                  Status: <span className="font-semibold">{subscription?.status === 'trialing' ? 'Em período de teste' : 'Ativo'}</span>
                </p>
                {subscription?.trial_end && new Date(subscription.trial_end) > new Date() && (
                  <p className="text-sm text-muted-foreground">
                    Teste grátis termina em {new Date(subscription.trial_end).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <Button variant="outline" size="sm" asChild className="mt-4">
                  <Link to="/dashboard/subscription">
                    Gerenciar Assinatura
                  </Link>
                </Button>
              </div>
            ) : (
              <Button asChild className="bg-gradient-canadian border-0">
                <Link to="/pricing">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Fazer Upgrade - 7 Dias Grátis
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/crs-calculator">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Calcular CRS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Descubra sua pontuação
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/express-entry/draws">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Últimos Draws</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Veja os convites recentes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/crs-history">
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${!isPro && 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base flex items-center gap-2">
                    Histórico CRS
                    {!isPro && <span className="text-xs bg-gradient-canadian text-white px-1.5 py-0.5 rounded">PRO</span>}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acompanhe sua evolução
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/simulations">
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${!isPro && 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base flex items-center gap-2">
                    Simulações
                    {!isPro && <span className="text-xs bg-gradient-canadian text-white px-1.5 py-0.5 rounded">PRO</span>}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Teste cenários "e se..."
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features Premium */}
        {!isPro && (
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Desbloqueie Recursos Premium
              </CardTitle>
              <CardDescription>
                Upgrade para o Plano Pro e tenha acesso completo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Histórico completo da sua pontuação CRS
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  Simulações ilimitadas de cenários
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Bell className="w-4 h-4 text-primary" />
                  Alertas automáticos de novos draws
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  Relatórios PDF detalhados
                </li>
              </ul>
              <Button asChild className="bg-gradient-canadian border-0 w-full">
                <Link to="/pricing">
                  Começar Teste Grátis de 7 Dias
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
