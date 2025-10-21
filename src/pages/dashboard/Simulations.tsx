import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProFeatureGuard } from '@/components/dashboard/ProFeatureGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus, TrendingUp } from 'lucide-react';

export default function Simulations() {
  return (
    <DashboardLayout>
      <ProFeatureGuard feature="simulations">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Simulações de Cenários</h1>
              <p className="text-muted-foreground mt-1">
                Teste diferentes cenários e veja o impacto na sua pontuação CRS
              </p>
            </div>
            <Button className="bg-gradient-canadian border-0">
              <Plus className="w-4 h-4 mr-2" />
              Nova Simulação
            </Button>
          </div>

          {/* Scenarios Info */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Como funcionam as simulações?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Teste "e se" cenários: "E se eu melhorar meu inglês para CLB 9?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Compare múltiplos cenários lado a lado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Veja o impacto exato de cada mudança na sua pontuação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Identifique as melhores estratégias para aumentar seu CRS</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Example Scenarios */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Melhorar Inglês</CardTitle>
                </div>
                <CardDescription>
                  Veja o impacto de melhorar sua nota no IELTS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Criar esta simulação
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Experiência Adicional</CardTitle>
                </div>
                <CardDescription>
                  Simule o ganho de pontos com mais tempo de experiência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Criar esta simulação
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Adicionar Francês</CardTitle>
                </div>
                <CardDescription>
                  Calcule os pontos extras ao aprender francês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Criar esta simulação
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Candidato Principal</CardTitle>
                </div>
                <CardDescription>
                  Compare ser candidato principal vs. cônjuge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Criar esta simulação
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Saved Simulations */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Simulações Salvas</CardTitle>
              <CardDescription>
                Acesse suas simulações anteriores a qualquer momento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Você ainda não criou nenhuma simulação
                  </p>
                  <Button className="bg-gradient-canadian border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Simulação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProFeatureGuard>
    </DashboardLayout>
  );
}
