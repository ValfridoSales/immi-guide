import { useState, useEffect } from 'react';
import { QuizState, QuizResponse, QuizResult, Lead } from '@/types/quiz';
import { quizQuestions } from '@/data/quiz-questions';
import { calculateQuizResults } from '@/utils/quiz-scoring';
import { QuizIntro } from '@/components/QuizIntro';
import { QuizQuestion } from '@/components/QuizQuestion';
import { QuizProgress } from '@/components/QuizProgress';
import { QuizResults } from '@/components/QuizResults';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { ThankYouPage } from '@/components/ThankYouPage';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendWelcomeEmail } from '@/utils/pdf';
import { storeQuizResults, updateQuizResultsWithLead } from '@/utils/quiz-results';
const Index = () => {
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [completionsCount, setCompletionsCount] = useState<number>(0);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));
  const [resultId, setResultId] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchCompletionsCount();
  }, []);
  const fetchCompletionsCount = async () => {
    try {
      const {
        data,
        error
      } = await supabase.rpc('get_quiz_completions_count');
      if (error) throw error;
      setCompletionsCount(data || 0);
    } catch (error) {
      console.error('Error fetching completions count:', error);
    }
  };
  const trackQuizCompletion = async () => {
    try {
      const {
        error
      } = await supabase.from('quiz_completions').insert([{
        session_id: sessionId
      }]);
      if (error) throw error;

      // Update the count locally
      setCompletionsCount(prev => prev + 1);
    } catch (error) {
      console.error('Error tracking quiz completion:', error);
    }
  };
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
  const handleNext = async () => {
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
      try {
        // Calculate results
        const calculatedResults = calculateQuizResults(responses);
        setResults(calculatedResults);

        // Store quiz results and get the resultId
        const storedResultId = await storeQuizResults(sessionId, calculatedResults);
        setResultId(storedResultId);
        
        setQuizState('results');

        // Track quiz completion
        await trackQuizCompletion();
      } catch (error) {
        console.error('Error storing quiz results:', error);
        toast({
          title: "Erro",
          description: "Houve um problema ao salvar os resultados. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const handleStartLeadCapture = () => {
    setQuizState('lead-capture');
  };
  const handleLeadSubmit = async (lead: Lead) => {
    try {
      console.log('Lead captured:', lead);
      
      if (!resultId) {
        toast({
          title: "Erro!",
          description: "Resultados não encontrados. Refaça o quiz.",
          variant: "destructive"
        });
        return;
      }

      // Update quiz results with lead data
      await updateQuizResultsWithLead(resultId, lead);
      
      // Send welcome email with PDF using resultId
      await sendWelcomeEmail(lead.email, resultId);
      
      toast({
        title: "Sucesso!",
        description: "Sua análise foi enviada para seu email."
      });
      setQuizState('thank-you');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Erro!",
        description: "Houve um problema ao enviar o email. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const handleRestart = () => {
    setQuizState('intro');
    setCurrentQuestionIndex(0);
    setResponses([]);
    setResults([]);
    setResultId(null);
  };
  return <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={handleRestart} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🍁</span>
              <span className="text-xl font-bold text-primary">
                Canada Immigration Quiz
              </span>
            </button>
            {quizState === 'questions' && <div className="text-sm text-muted-foreground">
                Pergunta {currentQuestionIndex + 1} de {quizQuestions.length}
              </div>}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {quizState === 'intro' && <QuizIntro onStart={handleStartQuiz} completionsCount={completionsCount} />}

        {quizState === 'questions' && currentQuestion && <div className="max-w-2xl mx-auto space-y-8">
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
          </div>}

        {quizState === 'results' && <div className="max-w-4xl mx-auto">
            <QuizResults results={results} onStartLeadCapture={handleStartLeadCapture} />
          </div>}

        {quizState === 'lead-capture' && <LeadCaptureForm onSubmit={handleLeadSubmit} results={results} />}

        {quizState === 'thank-you' && <ThankYouPage onRestart={handleRestart} />}
      </main>

      {/* Footer */}
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
    </div>;
};
export default Index;