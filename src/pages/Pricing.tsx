import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Bell, 
  FileText, 
  MessageCircle,
  Loader2 
} from 'lucide-react';

export default function Pricing() {
  const { user, isPro, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
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
        description: error.message || 'Não foi possível iniciar o checkout.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Histórico de Pontuação CRS',
      description: 'Acompanhe a evolução da sua pontuação ao longo do tempo com gráficos e análises detalhadas',
      free: false,
      pro: true,
    },
    {
      icon: Target,
      title: 'Simulações de Cenários',
      description: 'Teste cenários "e se..." para descobrir como melhorar sua pontuação',
      free: false,
      pro: true,
    },
    {
      icon: Bell,
      title: 'Alertas Automáticos',
      description: 'Receba notificações quando novos draws forem compatíveis com seu perfil',
      free: false,
      pro: true,
    },
    {
      icon: FileText,
      title: 'Relatórios PDF Ilimitados',
      description: 'Gere relatórios completos e profissionais sobre seu perfil de imigração',
      free: false,
      pro: true,
    },
    {
      icon: MessageCircle,
      title: 'Suporte Prioritário via WhatsApp',
      description: 'Acesso direto ao suporte com tempo de resposta garantido em 24h',
      free: false,
      pro: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-gradient-canadian border-0 text-white mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Planos e Preços
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas gratuitas para começar, recursos premium para acelerar sua jornada para o Canadá
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Plano Grátis</CardTitle>
              <CardDescription>
                Ferramentas essenciais para começar
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Quiz: descubra o programa ideal 🇨🇦</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Calculadora CRS completa</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Últimos Express Entry draws</span>
                </li>
              </ul>
              
              <Button 
                variant="outline" 
                className="w-full"
                disabled={!user}
                onClick={() => !user && navigate('/auth')}
              >
                {user ? 'Plano Atual' : 'Começar Grátis'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-primary shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-canadian border-0 text-white px-4 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Mais Popular
              </Badge>
            </div>
            
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                Plano Pro
                {isPro && (
                  <Badge variant="outline" className="text-xs">Ativo</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Acesso completo a todas as funcionalidades
              </CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">R$ 19,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">
                7 dias de teste grátis • Cancele quando quiser
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm font-medium">Tudo do plano Grátis, mais:</span>
                </li>
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">{feature.title}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-gradient-canadian border-0"
                onClick={handleUpgrade}
                disabled={isLoading || isPro}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : isPro ? (
                  'Plano Atual'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Começar Teste Grátis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Detail */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            O que você ganha com o Plano Pro
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-canadian flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona o teste grátis?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Você tem 7 dias completos para testar todas as funcionalidades premium sem custo. 
                  Se não cancelar antes do fim do período, será cobrado R$ 19,90/mês.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso cancelar a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sim! Você pode cancelar sua assinatura a qualquer momento através do portal de 
                  gerenciamento. Você terá acesso até o final do período já pago.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona o pagamento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Processamos pagamentos de forma segura através do Stripe. Aceitamos todos os 
                  principais cartões de crédito e débito.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
