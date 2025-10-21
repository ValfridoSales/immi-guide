import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProFeatureGuard } from '@/components/dashboard/ProFeatureGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

export default function Reports() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCRSReport = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header with Canadian colors
      doc.setFillColor(220, 38, 38); // Red
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório CRS - Guia Canadá', pageWidth / 2, 20, { align: 'center' });
      
      // Reset colors
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Report Date
      const today = new Date().toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Data do Relatório: ${today}`, 20, 45);
      
      // Section 1: CRS Score Summary
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Resumo da Pontuação CRS', 20, 60);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Pontuação Atual: -- pontos', 20, 70);
      doc.text('Última Atualização: --', 20, 78);
      doc.text('Status: Em análise', 20, 86);
      
      // Section 2: Score Breakdown
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Detalhamento da Pontuação', 20, 105);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const breakdown = [
        { category: 'Core/Human Capital', points: '--' },
        { category: 'Spouse/Common-law', points: '--' },
        { category: 'Skill Transferability', points: '--' },
        { category: 'Additional Points', points: '--' },
      ];
      
      let yPos = 115;
      breakdown.forEach(item => {
        doc.text(`${item.category}: ${item.points} pontos`, 25, yPos);
        yPos += 8;
      });
      
      // Section 3: Recommendations
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Recomendações para Aumentar sua Pontuação', 20, 160);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const recommendations = [
        'Melhore seu nível de inglês (IELTS/CELPIP)',
        'Considere fazer um teste de francês (TEF/TCF)',
        'Ganhe mais experiência de trabalho qualificado',
        'Obtenha uma nomeação provincial (PNP)',
        'Complete um programa de estudos no Canadá',
      ];
      
      yPos = 170;
      recommendations.forEach((rec, index) => {
        doc.text(`${index + 1}. ${rec}`, 25, yPos);
        yPos += 8;
      });
      
      // Section 4: Recent Draws Comparison
      doc.addPage();
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Comparação com Draws Recentes', pageWidth / 2, 20, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text('4. Últimos Express Entry Draws', 20, 45);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Esta seção compara sua pontuação com os últimos rounds de convites.', 20, 55);
      doc.text('Analise as tendências para entender suas chances de receber um ITA.', 20, 63);
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Guia Canadá - Relatório gerado em ${today} - Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      doc.save(`relatorio-crs-${new Date().getTime()}.pdf`);
      
      toast({
        title: 'Relatório gerado com sucesso!',
        description: 'Seu relatório PDF foi baixado.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message || 'Não foi possível gerar o relatório.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <ProFeatureGuard feature="reports">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Relatórios PDF</h1>
            <p className="text-muted-foreground mt-1">
              Gere relatórios profissionais e detalhados sobre seu perfil de imigração
            </p>
          </div>

          {/* Report Types */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle>Relatório CRS Completo</CardTitle>
                </div>
                <CardDescription>
                  Análise detalhada da sua pontuação CRS com recomendações personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateCRSReport}
                  disabled={isGenerating}
                  className="w-full bg-gradient-canadian border-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow opacity-60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle>Relatório de Evolução</CardTitle>
                </div>
                <CardDescription>
                  Histórico completo da evolução da sua pontuação ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Em Breve
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow opacity-60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Comparativo de Simulações</CardTitle>
                </div>
                <CardDescription>
                  Compare diferentes cenários e estratégias lado a lado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Em Breve
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow opacity-60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle>Análise de Mercado</CardTitle>
                </div>
                <CardDescription>
                  Tendências dos draws e previsões baseadas em dados históricos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Em Breve
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
              <CardDescription>
                Acesse seus relatórios gerados anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Você ainda não gerou nenhum relatório
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Gerar Relatório" acima para criar seu primeiro relatório
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Sobre os Relatórios PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Relatórios profissionais e detalhados em formato PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Análise completa da sua pontuação e recomendações personalizadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Comparação com os últimos draws do Express Entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ideal para apresentar ao seu consultor de imigração</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Geração ilimitada de relatórios para usuários Pro</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </ProFeatureGuard>
    </DashboardLayout>
  );
}
