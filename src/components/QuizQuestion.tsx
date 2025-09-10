import { QuizQuestion as QuizQuestionType, QuizOption } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedValue?: string;
  onSelect: (value: string) => void;
}

export function QuizQuestion({ question, selectedValue, onSelect }: QuizQuestionProps) {
  const getIcon = (questionId: string) => {
    const icons: { [key: string]: string } = {
      age: '🎂',
      education: '🎓',
      experience: '💼',
      english: '🇬🇧',
      french: '🇫🇷',
      funds: '💰',
      family: '👨‍👩‍👧‍👦',
      province: '🍁',
    };
    return icons[questionId] || '❓';
  };

  return (
    <Card className="p-8 shadow-elevated animate-fade-in">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">{getIcon(question.id)}</div>
          <h2 className="text-2xl font-bold text-foreground leading-tight">
            {question.title}
          </h2>
        </div>
        
        <div className="space-y-3">
          {question.options.map((option: QuizOption) => (
            <Button
              key={option.id}
              variant="quiz"
              size="lg"
              className={cn(
                "w-full text-left justify-start h-auto py-4 px-6 transition-all duration-200",
                selectedValue === option.value && "border-primary bg-gradient-subtle shadow-soft"
              )}
              onClick={() => onSelect(option.value)}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 transition-all",
                  selectedValue === option.value 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground"
                )}>
                  {selectedValue === option.value && (
                    <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                  )}
                </div>
                <span className="text-base font-medium">{option.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}