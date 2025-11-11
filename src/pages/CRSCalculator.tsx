import { useState, useEffect, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { CRSForm } from '@/components/crs/CRSForm';
import { CRSResults } from '@/components/crs/CRSResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { CRSResult, InputCRS } from '@/utils/crs-engine';
import { useSimulations } from '@/hooks/useSimulations';
import { useToast } from '@/hooks/use-toast';

const CRSCalculator = () => {
  const [result, setResult] = useState<CRSResult | null>(null);
  const [currentInput, setCurrentInput] = useState<InputCRS | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { setCurrentBaseInput } = useSimulations();
  const { toast } = useToast();

  // Atualizar base input no hook de simulações quando houver cálculo
  useEffect(() => {
    if (currentInput) {
      setCurrentBaseInput(currentInput);
    }
  }, [currentInput, setCurrentBaseInput]);

  const handleCalculate = (calcResult: CRSResult, input: InputCRS) => {
    setResult(calcResult);
    setCurrentInput(input);
    
    // Mostrar toast de sucesso
    toast({
      title: "✅ Cálculo concluído!",
      description: `Sua pontuação CRS é ${calcResult.total}`,
      duration: 4000,
    });
    
    // Scroll suave para os resultados
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
              Calculadora CRS
            </h1>
            <p className="text-muted-foreground text-lg">
              Calcule sua pontuação do Comprehensive Ranking System (Express Entry)
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Regras 2025+:</strong> Desde 25/03/2025, ofertas de trabalho (job offers) não somam pontos no CRS. 
              Esta calculadora está atualizada com as regras mais recentes do IRCC.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Preencha suas informações</CardTitle>
              <CardDescription>
                Complete o formulário abaixo com seus dados pessoais, educação, experiência e idiomas.
                Todas as informações são mantidas apenas no seu navegador.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CRSForm onCalculate={handleCalculate} />
            </CardContent>
          </Card>

          {result && currentInput && (
            <div ref={resultsRef} className="animate-fade-in">
              <CRSResults result={result} inputData={currentInput} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CRSCalculator;
