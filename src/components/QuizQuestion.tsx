import { QuizQuestion as QuizQuestionType, QuizOption } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedValue?: string;
  onSelect: (value: string) => void;
}

export function QuizQuestion({ question, selectedValue, onSelect }: QuizQuestionProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  
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
            {question.id === 'canada_experience' ? (
              question.title.split('Canadá').map((part, index, array) => (
                index < array.length - 1 ? (
                  <span key={index}>
                    {part}<span className="text-canadian-red">Canadá</span>
                  </span>
                ) : part
              ))
            ) : (
              question.title
            )}
          </h2>
        </div>

        {question.helpInfo && (
          <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Info className="h-4 w-4" />
                <span>{question.helpInfo.title}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  helpOpen && "transform rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {question.helpInfo.content.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h4 key={index} className="font-semibold mt-4 mb-2 first:mt-0">
                          {line.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }
                    if (line.startsWith('• ')) {
                      return (
                        <li key={index} className="ml-4">
                          {line.substring(2)}
                        </li>
                      );
                    }
                    if (line.includes('[') && line.includes('](')) {
                      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
                      if (linkMatch) {
                        return (
                          <p key={index} className="mb-2">
                            <a 
                              href={linkMatch[2]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {linkMatch[1]}
                            </a>
                          </p>
                        );
                      }
                    }
                    if (line.trim() === '') {
                      return <br key={index} />;
                    }
                    return <p key={index} className="mb-2">{line}</p>;
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
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