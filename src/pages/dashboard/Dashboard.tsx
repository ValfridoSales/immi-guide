import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { TrendingUp, Target, Bell, FileText, Sparkles, Calculator, CalendarDays, CheckCircle2, XCircle, Info, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

// Helper function to expand program abbreviations
const expandProgramName = (name: string): string => {
  const expansions: Record<string, string> = {
    'PNP': 'Provincial Nominee Program',
    'CEC': 'Canadian Experience Class',
    'FSW': 'Federal Skilled Worker',
    'FST': 'Federal Skilled Trades'
  };

  // Check if the name is exactly an abbreviation
  if (expansions[name.toUpperCase()]) {
    return expansions[name.toUpperCase()];
  }

  // Return as-is if not an abbreviation
  return name;
};

// Helper function to get score level
const getScoreLevel = (score: number): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} => {
  if (score >= 500) return {
    label: "Excelente",
    variant: "default"
  };
  if (score >= 450) return {
    label: "Muito Bom",
    variant: "default"
  };
  if (score >= 400) return {
    label: "Bom",
    variant: "secondary"
  };
  if (score >= 350) return {
    label: "Regular",
    variant: "secondary"
  };
  return {
    label: "Baixo",
    variant: "outline"
  };
};
const getScoreColor = (score: number): string => {
  if (score >= 500) return "text-primary";
  if (score >= 450) return "text-primary";
  if (score >= 400) return "text-blue-600 dark:text-blue-400";
  if (score >= 350) return "text-orange-600 dark:text-orange-400";
  return "text-destructive";
};

// Helper function to format date in Portuguese
const formatDrawDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};
export default function Dashboard() {
  const {
    profile,
    subscription,
    isPro
  } = useAuth();
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
        const {
          data,
          error
        } = await supabase.from('crs_calculations').select('total_score, created_at').eq('user_id', profile.id).order('created_at', {
          ascending: false
        }).limit(1).maybeSingle();
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
        const {
          data,
          error
        } = await supabase.from('express_entry_draws').select('date, type, category, invitations, crs_min').order('date', {
          ascending: false
        }).limit(1).maybeSingle();
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
  return <TooltipProvider>
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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Card CRS - apenas para premium */}
          {isPro && <Card className="border-primary/20 md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground text-center">
                  Sua Pontuação Total CRS
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                {isLoadingCRS ? <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div> : latestCRS ? <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-5xl font-bold bg-[linear-gradient(90deg,_hsl(var(--canadian-red))_0%,_hsl(var(--primary))_35%,_hsl(var(--canadian-blue))_100%)] bg-clip-text text-transparent">
                        {latestCRS}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {getScoreLevel(latestCRS).label}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Progress value={latestCRS / 1200 * 100} variant="canadian" className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {latestCRS} de 1200 pontos possíveis
                      </p>
                    </div>
                  </div> : <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground">
                      Nenhum cálculo ainda
                    </p>
                    <Button variant="link" size="sm" asChild className="mt-1 p-0 h-auto text-xs">
                      <Link to="/crs-calculator">Calcular agora</Link>
                    </Button>
                  </div>}
              </CardContent>
            </Card>}

          {/* Card Último Draw */}
          <Card className="border-primary/20 md:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-canadian-red/20 dark:bg-canadian-red/30 border-2 border-canadian-red flex items-center justify-center flex-shrink-0">
                  <Circle className="w-3 h-3 fill-canadian-red text-canadian-red" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Último Sorteio Express Entry
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-4 space-y-4">
              {isLoadingDraw ? <div className="flex items-center justify-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div> : latestDraw ? <>
                  {/* Data + Programa */}
                  <div className="text-sm text-muted-foreground">
                    {formatDrawDate(latestDraw.date)} — {expandProgramName(latestDraw.category || latestDraw.type)}
                  </div>
                  
                  {/* Grid com 2 boxes */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Box Nota de Corte */}
                    <div className="rounded-lg border border-border/50 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Nota de corte:</p>
                      <span className="text-2xl font-bold text-canadian-red dark:text-canadian-red">
                        {latestDraw.crs_min}
                      </span>
                    </div>
                    
                    {/* Box Convites */}
                    <div className="rounded-lg border border-border/50 p-4 space-y-1">
                      <p className="text-xs text-muted-foreground">Convites:</p>
                      <span className="text-2xl font-bold text-canadian-blue dark:text-canadian-blue">
                        {latestDraw.invitations.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </> : <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum sorteio disponível
                  </p>
                </div>}
            </CardContent>
          </Card>

          {/* Card Análise de Elegibilidade - apenas para Pro users com CRS */}
          {isPro && latestCRS && latestDraw && !isLoadingCRS && !isLoadingDraw && <Card className={`border-2 md:col-span-1 ${latestCRS >= latestDraw.crs_min ? 'bg-green-50 dark:bg-green-950/20 border-green-500/50' : 'bg-red-50 dark:bg-red-950/20 border-red-500/50'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {latestCRS >= latestDraw.crs_min ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> : <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                  Status de Elegibilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {latestCRS >= latestDraw.crs_min ? <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-green-700 dark:text-green-400">
                        🎉 Parabéns! Você seria convidado!
                      </p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            Esta análise considera apenas pontos CRS. Verifique se você atende aos demais critérios de elegibilidade para a categoria específica do sorteio.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400">
                        +{latestCRS - latestDraw.crs_min} pontos acima do corte
                      </Badge>
                    </div>
                  </div> : <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-red-700 dark:text-red-400">
                          Você ainda não seria convidado
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Faltam <span className="font-semibold text-red-600 dark:text-red-400">
                          {latestDraw.crs_min - latestCRS} pontos</span> para o corte
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            Esta análise considera apenas pontos CRS. Verifique se você atende aos demais critérios de elegibilidade para a categoria específica do sorteio.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <Button variant="outline" size="sm" asChild className="w-full border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Link to="/dashboard/simulations">
                        <Target className="w-3 h-3 mr-2" />
                        Veja como melhorar seus pontos
                      </Link>
                    </Button>
                  </div>}
              </CardContent>
            </Card>}
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
              {isPro ? <Badge className="bg-gradient-canadian border-0 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Plano Pro
                </Badge> : <Badge variant="outline">Plano Grátis</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {isPro ? <div className="space-y-2">
                <p className="text-sm">
                  Status: <span className="font-semibold">{subscription?.status === 'trialing' ? 'Em período de teste' : 'Ativo'}</span>
                </p>
                {subscription?.trial_end && new Date(subscription.trial_end) > new Date() && <p className="text-sm text-muted-foreground">
                    Teste grátis termina em {new Date(subscription.trial_end).toLocaleDateString('pt-BR')}
                  </p>}
                <Button variant="outline" size="sm" asChild className="mt-4">
                  <Link to="/dashboard/subscription">
                    Gerenciar Assinatura
                  </Link>
                </Button>
              </div> : <Button asChild className="bg-gradient-canadian border-0">
                <Link to="/pricing">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Fazer Upgrade - 7 Dias Grátis
                </Link>
              </Button>}
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
        {!isPro && <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
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
          </Card>}
      </div>
      </DashboardLayout>
    </TooltipProvider>;
}