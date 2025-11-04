import { QuizResult } from '@/types/quiz';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgramCard } from '@/components/pdf/ProgramCard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storeQuizResults } from '@/utils/quiz-results';
import { Save, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QuizResultsProps {
  results: QuizResult[];
  onRestart: () => void;
}

export function QuizResults({ results, onRestart }: QuizResultsProps) {
  const topResults = results.slice(0, 3);
  const { user, isPro, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveResults = async () => {
    // Verificação 1: Usuário não está autenticado
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar seus resultados",
      });
      navigate('/auth', { 
        state: { 
          returnTo: '/pricing',
          message: 'Crie uma conta PRO para salvar seus resultados do quiz'
        }
      });
      return;
    }

    // Verificação 2: Usuário não é PRO
    if (!isPro) {
      toast({
        title: "Recurso Premium",
        description: "Apenas usuários PRO podem salvar resultados do quiz",
        variant: "default",
      });
      navigate('/pricing');
      return;
    }

    // Usuário é PRO - pode salvar
    setIsSaving(true);
    try {
      const resultId = await storeQuizResults(user.id, results);
      
      toast({
        title: "Resultados salvos!",
        description: "Você pode acessá-los no seu dashboard a qualquer momento.",
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/quiz-results')}
          >
            Ver Agora
          </Button>
        ),
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar seus resultados",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-4xl">🎉</div>
        <h1 className="text-3xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
          Seus Resultados Personalizados
        </h1>
        <p className="text-lg text-muted-foreground">
          Baseado no seu perfil, aqui estão os melhores programas para você
        </p>
      </div>

      {/* Results Cards */}
      <div className="space-y-6">
        {topResults.map((result, index) => (
          <ProgramCard 
            key={result.programId} 
            result={result} 
            index={index} 
            printMode={false}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onRestart}
            className="text-lg px-8 py-3"
          >
            Refazer Quiz
          </Button>
          
          <Button 
            variant="canadian"
            size="lg" 
            onClick={handleSaveResults}
            disabled={isSaving || authLoading}
            className="text-lg px-8 py-3"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Resultados
              </>
            )}
          </Button>
        </div>

        {/* Badge PRO */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Recurso exclusivo PRO
          </Badge>
        </div>
      </div>
    </div>
  );
}