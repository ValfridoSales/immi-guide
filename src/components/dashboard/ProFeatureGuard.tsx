import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, Lock } from 'lucide-react';

interface ProFeatureGuardProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
}

export function ProFeatureGuard({ children, feature, fallback }: ProFeatureGuardProps) {
  const { isPro } = useAuth();

  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureNames: Record<string, string> = {
    crs_history: 'Histórico de Pontuação CRS',
    simulations: 'Simulações de Cenários',
    alerts: 'Alertas de Draws',
    reports: 'Relatórios PDF Premium',
    whatsapp: 'Suporte WhatsApp Prioritário',
    quiz_results: 'Resultados Salvos do Quiz',
  };

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-muted-foreground" />
        </div>
        <CardTitle>Feature Premium</CardTitle>
        <CardDescription>
          {featureNames[feature] || 'Esta funcionalidade'} está disponível apenas no Plano Pro
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pb-6">
        <Button asChild className="bg-gradient-canadian border-0">
          <Link to="/pricing">
            <Sparkles className="w-4 h-4 mr-2" />
            Fazer Upgrade para Pro
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          7 dias de teste grátis • Cancele quando quiser
        </p>
      </CardContent>
    </Card>
  );
}
