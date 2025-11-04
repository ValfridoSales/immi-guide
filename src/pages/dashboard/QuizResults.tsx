import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProFeatureGuard } from '@/components/dashboard/ProFeatureGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getUserQuizResults, deleteQuizResult, StoredQuizResult } from '@/utils/quiz-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClipboardList, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function QuizResults() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<StoredQuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadResults();
    }
  }, [user]);

  const loadResults = async () => {
    if (!user) return;
    
    try {
      const data = await getUserQuizResults(user.id);
      setResults(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar resultados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (resultId: string) => {
    try {
      await deleteQuizResult(resultId);
      setResults(prev => prev.filter(r => r.id !== resultId));
      toast({
        title: "Resultado deletado",
        description: "O resultado foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <ProFeatureGuard feature="quiz_results">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Meus Resultados do Quiz</h1>
            <p className="text-muted-foreground mt-2">
              Histórico dos seus resultados salvos do Quiz de Imigração
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando resultados...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && results.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum resultado salvo</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Você ainda não salvou nenhum resultado do Quiz de Imigração.
                  Faça o quiz e salve seus resultados para acompanhar sua jornada.
                </p>
                <Button asChild variant="canadian">
                  <Link to="/quiz">
                    Fazer Quiz Agora
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {!isLoading && results.length > 0 && (
            <div className="grid gap-4">
              {results.map((result, index) => (
                <SavedResultCard 
                  key={result.id}
                  result={result}
                  isLatest={index === 0}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </ProFeatureGuard>
    </DashboardLayout>
  );
}

function SavedResultCard({ 
  result, 
  isLatest, 
  onDelete 
}: { 
  result: StoredQuizResult; 
  isLatest: boolean;
  onDelete: (id: string) => void;
}) {
  const topThree = result.results.slice(0, 3);
  const formattedDate = format(new Date(result.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {formattedDate}
              {isLatest && (
                <Badge variant="default" className="bg-gradient-canadian border-0">
                  Mais Recente
                </Badge>
              )}
            </CardTitle>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deletar resultado?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O resultado será removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(result.id)}>
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
            Top 3 Programas Recomendados
          </h4>
          <div className="space-y-3">
            {topThree.map((program, index) => (
              <div key={program.programId} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-canadian flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{program.programName}</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-canadian h-2 rounded-full transition-all"
                      style={{ width: `${program.compatibility}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {program.compatibility}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
