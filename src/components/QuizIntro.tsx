import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle } from 'lucide-react';

interface QuizIntroProps {
  onStart: () => void;
}

export function QuizIntro({ onStart }: QuizIntroProps) {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="text-6xl">🍁</div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-canadian bg-clip-text text-transparent leading-tight">
            Quiz de Imigração para o Canadá
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra qual programa de imigração é perfeito para o seu perfil em apenas 3 minutos
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 text-center">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">12,487</strong> pessoas fizeram este quiz
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">2-3 min</strong> para completar
            </span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="p-8 shadow-elevated">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Como funciona nosso quiz?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold">Responda 8 perguntas</h3>
                <p className="text-sm text-muted-foreground">
                  Sobre idade, educação, experiência, idiomas e objetivos
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold">Análise personalizada</h3>
                <p className="text-sm text-muted-foreground">
                  Nosso algoritmo avalia seu perfil contra todos os programas
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold">Recomendações práticas</h3>
                <p className="text-sm text-muted-foreground">
                  Top 3 programas com próximos passos detalhados
                </p>
              </div>
            </div>

            {/* What you'll get */}
            <div className="bg-gradient-subtle p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">O que você vai receber:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Ranking dos melhores programas para você',
                  'Análise de compatibilidade personalizada',
                  'Tempo estimado e custos por programa',
                  'Seus pontos fortes e áreas a melhorar',
                  'Próximos passos práticos e detalhados',
                  'Análise completa gratuita por email'
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Programs evaluated */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Programas avaliados:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Express Entry',
                  'Provincial Nominee Program',
                  'Quebec Skilled Worker',
                  'Family Sponsorship',
                  'Study Permit → PR',
                  'Startup Visa'
                ].map((program) => (
                  <Badge key={program} variant="secondary">
                    {program}
                  </Badge>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <Button 
                variant="canadian" 
                size="lg" 
                onClick={onStart}
                className="text-lg px-8 py-3"
              >
                Começar Quiz Gratuito
              </Button>
              <p className="text-sm text-muted-foreground">
                ✅ 100% gratuito • ✅ Sem cadastro • ✅ Resultados instantâneos
              </p>
            </div>
          </div>
        </Card>

        {/* Trust signals */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Baseado em dados oficiais do governo canadense e atualizado regularmente
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>🔒 Seus dados estão seguros</span>
            <span>📊 Algoritmo baseado em casos reais</span>
            <span>🇨🇦 Atualizado com as regras de 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}