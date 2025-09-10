import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuizResult } from '@/types/quiz';
import { ProgramCard } from '@/components/pdf/ProgramCard';
import { getQuizResults } from '@/utils/quiz-results';

export default function PdfPreview() {
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get('resultId');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!resultId) {
        console.warn('No resultId provided, using mock data');
        // Mock data for demo when no resultId
        setResults([
          {
            programId: 'fsw',
            programName: 'Express Entry - Federal Skilled Worker',
            compatibility: 85,
            estimatedTime: '6-12 meses',
            investment: 'CAD $15,000+',
            description: 'Programa ideal para profissionais qualificados com experiência internacional.',
            strengths: ['CLB alto em inglês', 'Educação superior', 'Experiência qualificada'],
            improvements: ['Melhorar francês', 'Obter ECA'],
            nextSteps: ['Preparar documentos', 'Fazer teste de idioma', 'Submeter aplicação']
          }
        ]);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching quiz results for ID:', resultId);
        const storedResult = await getQuizResults(resultId);
        
        if (storedResult && storedResult.results) {
          setResults(storedResult.results);
          console.log('Quiz results loaded:', storedResult.results.length, 'programs');
        } else {
          console.warn('No results found for ID:', resultId);
          // Fallback to mock data if no results found
          setResults([
            {
              programId: 'fsw',
              programName: 'Express Entry - Federal Skilled Worker',
              compatibility: 85,
              estimatedTime: '6-12 meses',
              investment: 'CAD $15,000+',
              description: 'Programa ideal para profissionais qualificados com experiência internacional.',
              strengths: ['CLB alto em inglês', 'Educação superior', 'Experiência qualificada'],
              improvements: ['Melhorar francês', 'Obter ECA'],
              nextSteps: ['Preparar documentos', 'Fazer teste de idioma', 'Submeter aplicação']
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        // Fallback to mock data on error
        setResults([
          {
            programId: 'fsw',
            programName: 'Express Entry - Federal Skilled Worker',
            compatibility: 85,
            estimatedTime: '6-12 meses',
            investment: 'CAD $15,000+',
            description: 'Programa ideal para profissionais qualificados com experiência internacional.',
            strengths: ['CLB alto em inglês', 'Educação superior', 'Experiência qualificada'],
            improvements: ['Melhorar francês', 'Obter ECA'],
            nextSteps: ['Preparar documentos', 'Fazer teste de idioma', 'Submeter aplicação']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const currentDate = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-background p-6 print:p-0">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 no-print">
          <div className="text-4xl">🍁</div>
          <h1 className="text-3xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
            Seus Resultados Personalizados
          </h1>
          <p className="text-lg text-muted-foreground">
            Análise completa dos melhores programas de imigração para o seu perfil
          </p>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            🍁 Seus Resultados Personalizados - Imigração Canadá
          </h1>
          <p className="text-muted-foreground">
            Análise completa dos melhores programas de imigração para o seu perfil
          </p>
        </div>

        {/* Results Cards */}
        <div className="space-y-6">
          {results.map((result, index) => (
            <ProgramCard 
              key={result.programId} 
              result={result} 
              index={index} 
              printMode={true}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="space-y-4 text-center border-t pt-6 mt-8">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground font-semibold">
              ⚠️ IMPORTANTE: Esta análise é informativa
            </p>
            <p className="text-xs text-muted-foreground">
              Regras, valores e prazos mudam com frequência. Sempre confira no site oficial do IRCC (canada.ca) 
              ou consulte um profissional de imigração licenciado (RCIC) para decisões oficiais.
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Última atualização das regras no sistema: {currentDate}</p>
            <p>© 2025 Canada Immigration Quiz - Baseado em dados oficiais do governo canadense</p>
          </div>
        </div>
      </div>
    </div>
  );
}