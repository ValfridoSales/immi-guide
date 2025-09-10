import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Clock } from 'lucide-react';

interface ThankYouPageProps {
  onRestart: () => void;
}

export function ThankYouPage({ onRestart }: ThankYouPageProps) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="p-8 text-center shadow-elevated">
        <div className="space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Análise Enviada com Sucesso! 🎉
            </h1>
            <p className="text-lg text-muted-foreground">
              Sua análise personalizada foi enviada para seu email
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-subtle p-6 rounded-lg space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              Próximos Passos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-left">Confira sua caixa de entrada (e spam) em até 5 minutos</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-left">Você receberá emails com dicas e atualizações úteis</span>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="text-left space-y-4">
            <h4 className="text-lg font-semibold text-center">O que você recebeu:</h4>
            <div className="grid gap-3">
              {[
                'Calculadora detalhada do CRS Score (Express Entry)',
                'Cronograma personalizado mês a mês',
                'Checklist completo de documentos necessários',
                'Lista de cursos para melhorar inglês/francês',
                'Contatos de consultores regulamentados (RCIC)',
                'Guia detalhado de custos por programa'
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button 
              variant="canadian" 
              size="lg" 
              onClick={onRestart}
              className="w-full"
            >
              Fazer o Quiz Novamente
            </Button>
            <p className="text-xs text-muted-foreground">
              Compartilhe este quiz com amigos que também querem imigrar para o Canadá
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Aviso:</strong> Esta ferramenta é apenas informativa. Para decisões oficiais sobre imigração, 
              consulte sempre o site oficial canada.ca ou um consultor de imigração regulamentado (RCIC).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}