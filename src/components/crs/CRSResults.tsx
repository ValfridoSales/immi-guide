import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, Users, Briefcase, Gift, ArrowRight, Save, Check } from 'lucide-react';
import type { CRSResult } from '@/utils/crs-engine';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface CRSResultsProps {
  result: CRSResult;
  formData?: any;
}

export function CRSResults({ result, formData }: CRSResultsProps) {
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const maxCore = 500; // Simplified for display
  const maxTotal = 1200; // PNP can add 600

  const handleSaveCalculation = async () => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Faça login para salvar seus cálculos.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('crs_calculations')
        .insert({
          user_id: user.id,
          total_score: result.total,
          core_score: result.core,
          spouse_score: result.spouse,
          transferability_score: result.transferability,
          additional_score: result.additional,
          calculation_data: formData || {},
        });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: 'Cálculo salvo!',
        description: 'Seu cálculo CRS foi salvo no histórico.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar o cálculo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 500) return 'text-green-600 dark:text-green-400';
    if (score >= 450) return 'text-blue-600 dark:text-blue-400';
    if (score >= 400) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 500) return { label: 'Excelente', variant: 'default' as const };
    if (score >= 450) return { label: 'Muito Bom', variant: 'secondary' as const };
    if (score >= 400) return { label: 'Bom', variant: 'outline' as const };
    return { label: 'Regular', variant: 'outline' as const };
  };

  const scoreLevel = getScoreLevel(result.total);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      {/* Total Score Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-3">
          <CardDescription>Sua Pontuação Total CRS</CardDescription>
          <CardTitle className={`text-6xl font-bold ${getScoreColor(result.total)}`}>
            {result.total}
          </CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant={scoreLevel.variant}>{scoreLevel.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress 
            value={(result.total / maxTotal) * 100} 
            className="h-3"
            variant="canadian"
          />
          <p className="text-sm text-muted-foreground text-center">
            {result.total} de {maxTotal} pontos possíveis
          </p>
          
          {/* Save Button */}
          {user && (
            <div className="pt-2 border-t">
              <Button
                onClick={handleSaveCalculation}
                disabled={isSaving || isSaved || !isPro}
                className="w-full"
                variant={isSaved ? "outline" : "default"}
              >
                {isSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Salvo no Histórico
                  </>
                ) : isSaving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-pulse" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar no Histórico {!isPro && '(Pro)'}
                  </>
                )}
              </Button>
              {!isPro && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Faça upgrade para Pro para salvar cálculos no histórico
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Core/Human Capital */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Core/Human Capital
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.core}</div>
            <Progress value={(result.core / maxCore) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Idade, educação, idioma, experiência canadense
            </p>
          </CardContent>
        </Card>

        {/* Spouse Factors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fatores do Cônjuge
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.spouse}</div>
            <Progress value={(result.spouse / 40) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Educação, idioma e experiência do cônjuge (máx. 40)
            </p>
          </CardContent>
        </Card>

        {/* Transferability */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transferabilidade de Competências
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.transferability}</div>
            <Progress value={(result.transferability / 100) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Combinações de educação, idioma e experiência (máx. 100)
            </p>
          </CardContent>
        </Card>

        {/* Additional Points */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pontos Adicionais
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.additional}</div>
            <Progress value={Math.min((result.additional / 600) * 100, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              PNP, francês, irmão no Canadá, estudo canadense
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Completo</CardTitle>
          <CardDescription>Veja como sua pontuação foi calculada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Core/Human Capital</span>
              <span className="text-lg font-bold">{result.core} pts</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Spouse Factors</span>
              <span className="text-lg font-bold">{result.spouse} pts</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Skill Transferability</span>
              <span className="text-lg font-bold">{result.transferability} pts</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Additional Points</span>
              <span className="text-lg font-bold">{result.additional} pts</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-primary/10 px-3 rounded-lg mt-2">
              <span className="text-lg font-bold">Total CRS</span>
              <span className={`text-2xl font-bold ${getScoreColor(result.total)}`}>
                {result.total} pts
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compare with Draws */}
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Compare sua pontuação com os últimos draws do Express Entry</span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/express-entry/draws">
              Ver Draws <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AlertDescription>
      </Alert>

      {/* Tips based on score */}
      {result.total < 450 && (
        <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-400">
              Dicas para Melhorar sua Pontuação
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Melhorar pontuação no teste de idioma (IELTS/CELPIP)</li>
              <li>Obter experiência de trabalho canadense</li>
              <li>Considerar fazer mestrado ou pós-graduação</li>
              <li>Estudar francês para bônus de idioma (+25 ou +50 pontos)</li>
              <li>Buscar nomeação provincial (PNP) para +600 pontos</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
