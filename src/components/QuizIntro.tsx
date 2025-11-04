import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, Gift } from 'lucide-react';

interface QuizIntroProps {
  onStart: () => void;
}

export function QuizIntro({ onStart }: QuizIntroProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 animate-fade-in">
      <div className="text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 pt-8">
          <div className="text-7xl animate-scale-in">🍁</div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-canadian bg-clip-text text-transparent leading-tight">
            Quiz de Imigração
            <br />
            Canadá
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto font-light">
            Descubra seu caminho em 3 minutos
          </p>
        </div>

        {/* Main Card with Key Points */}
        <Card className="p-8 md:p-12 shadow-elevated border-2 hover:border-primary/20 transition-all duration-300">
          <div className="space-y-10">
            {/* Key Benefits - Visual Icons */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3 group hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-canadian-blue/20 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg">3 minutos</h3>
                <p className="text-sm text-muted-foreground">Rápido e objetivo</p>
              </div>

              <div className="space-y-3 group hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-canadian-red/20 to-primary/20 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Sparkles className="w-8 h-8 text-canadian-red" />
                </div>
                <h3 className="font-bold text-lg">Top 3 programas</h3>
                <p className="text-sm text-muted-foreground">Personalizados para você</p>
              </div>

              <div className="space-y-3 group hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Gift className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg">100% gratuito</h3>
                <p className="text-sm text-muted-foreground">Sem cadastro necessário</p>
              </div>
            </div>

            {/* CTA - More Prominent */}
            <div className="space-y-4 pt-4">
              <Button 
                variant="canadian" 
                size="lg" 
                onClick={onStart} 
                className="text-xl px-12 py-6 h-auto font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                Começar Agora
              </Button>
              <p className="text-sm text-muted-foreground">
                ✓ Resultados instantâneos
              </p>
            </div>
          </div>
        </Card>

        {/* Trust Signal - Consolidated */}
        <p className="text-sm text-muted-foreground pb-8">
          🇨🇦 Baseado em dados oficiais do governo canadense • Atualizado 2025
        </p>
      </div>
    </div>
  );
}