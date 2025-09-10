import { Progress } from '@/components/ui/progress';

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function QuizProgress({ currentStep, totalSteps }: QuizProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Pergunta {currentStep} de {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress} 
        variant="canadian"
        className="h-3 animate-progress"
      />
    </div>
  );
}