import { useState } from 'react';
import { QuizState, QuizResponse, QuizResult } from '@/types/quiz';
import { quizQuestions } from '@/data/quiz-questions';
import { calculateQuizResults } from '@/utils/quiz-scoring';
import { QuizIntro } from '@/components/QuizIntro';
import { QuizQuestion } from '@/components/QuizQuestion';
import { QuizProgress } from '@/components/QuizProgress';
import { QuizResults } from '@/components/QuizResults';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Quiz = () => {
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const { toast } = useToast();

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.id);

  const handleStartQuiz = () => {
    setQuizState('questions');
    setCurrentQuestionIndex(0);
    setResponses([]);
  };

  const handleAnswer = (value: string) => {
    const newResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    newResponses.push({
      questionId: currentQuestion.id,
      selectedValues: [value]
    });
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (!currentResponse) {
      toast({
        title: "Resposta obrigatória",
        description: "Por favor, selecione uma opção antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const calculatedResults = calculateQuizResults(responses);
      setResults(calculatedResults);
      setQuizState('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setQuizState('intro');
    setCurrentQuestionIndex(0);
    setResponses([]);
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {quizState === 'questions' && (
          <div className="max-w-2xl mx-auto mb-4">
            <div className="text-sm text-muted-foreground text-center">
              Pergunta {currentQuestionIndex + 1} de {quizQuestions.length}
            </div>
          </div>
        )}

        {quizState === 'intro' && <QuizIntro onStart={handleStartQuiz} />}

        {quizState === 'questions' && currentQuestion && (
          <div className="max-w-2xl mx-auto space-y-8">
            <QuizProgress currentStep={currentQuestionIndex + 1} totalSteps={quizQuestions.length} />
            
            <QuizQuestion question={currentQuestion} selectedValue={currentResponse?.selectedValues[0]} onSelect={handleAnswer} />

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>

              <Button variant="canadian" onClick={handleNext} className="flex items-center space-x-2">
                <span>
                  {currentQuestionIndex === quizQuestions.length - 1 ? 'Ver Resultados' : 'Próximo'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {quizState === 'results' && (
          <div className="max-w-4xl mx-auto">
            <QuizResults results={results} onRestart={handleRestart} />
          </div>
        )}
      </main>

      <footer className="bg-background border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Aviso importante:</strong> Esta ferramenta é apenas informativa. Para decisões oficiais sobre imigração, 
              consulte sempre o site oficial{' '}
              <a href="https://canada.ca" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                canada.ca
              </a>{' '}
              ou um consultor de imigração regulamentado (RCIC).
            </p>
            <p className="text-xs text-muted-foreground">© 2025 Canada Immigration Quiz. Baseado em dados oficiais do governo canadense.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Quiz;
