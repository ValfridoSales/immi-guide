import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Calculator, TrendingUp, ClipboardList, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import airportImage from '@/assets/airport-journey.png';
import { useInView } from '@/hooks/useInView';

const Index = () => {
  const [headerRef, headerInView] = useInView();
  const [gridRef, gridInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  return (
    <div className="min-h-screen bg-background">
      <Navigation fixed />
      <div className="pt-16">

      {/* Hero Section with Video Background */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative z-10 text-left px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Acelere o seu plano Canadá
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A plataforma mais completa para sua jornada de imigração
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button asChild size="lg" variant="canadian" className="text-lg">
              <Link to="/auth">Começar Agora</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg bg-white/10 text-white border-white hover:bg-white/20">
              <Link to="/crs-calculator">Calcular CRS</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ferramentas Essenciais</h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para planejar sua imigração
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Quiz de Imigração */}
            <Card className="border-2 border-primary transition-all duration-300 hover:scale-105 hover:shadow-elevated">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-canadian rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Quiz de Imigração</CardTitle>
                <CardDescription>
                  Descubra qual programa de imigração é ideal para você em apenas 3 minutos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>✓ Análise personalizada do seu perfil</li>
                  <li>✓ Recomendações de programas</li>
                  <li>✓ Próximos passos detalhados</li>
                </ul>
                <Button asChild variant="quiz" className="w-full">
                  <a href="/quiz">Fazer Quiz Gratuito</a>
                </Button>
              </CardContent>
            </Card>

            {/* Express Entry Draws */}
            <Card className="border-2 border-primary transition-all duration-300 hover:scale-105 hover:shadow-elevated">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-canadian rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Express Entry Draws</CardTitle>
                <CardDescription>
                  Acompanhe os sorteios do Express Entry em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>✓ Dados atualizados dos draws</li>
                  <li>✓ Gráficos e tendências</li>
                  <li>✓ Análise histórica completa</li>
                </ul>
                <Button asChild variant="quiz" className="w-full">
                  <Link to="/express-entry/draws">Ver Draws</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Calculadora CRS */}
            <Card className="border-2 border-primary transition-all duration-300 hover:scale-105 hover:shadow-elevated">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-canadian rounded-lg flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Calculadora CRS</CardTitle>
                <CardDescription>
                  Calcule sua pontuação CRS e descubra suas chances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <li>✓ Cálculo preciso e oficial</li>
                  <li>✓ Simulações de cenários</li>
                  <li>✓ Histórico de pontuações</li>
                </ul>
                <Button asChild variant="quiz" className="w-full">
                  <Link to="/crs-calculator">Calcular Agora</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Half - Background Image */}
          <div className="lg:w-1/2 h-64 lg:h-auto">
            <img 
              src={airportImage} 
              alt="Journey to Canada" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Half - Content with White Background */}
          <div className="lg:w-1/2 bg-white py-20 px-8 flex items-center">
            <div className="max-w-2xl mx-auto text-center w-full">
          <div 
            ref={headerRef}
            className={`mb-12 transition-all duration-1000 ${
              headerInView 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            <Award className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-4xl font-bold mb-4">
              A Ferramenta Mais Completa Disponível
            </h2>
            <p className="text-xl text-muted-foreground">
              Combine todas as ferramentas essenciais em um único lugar
            </p>
          </div>

          <div 
            ref={gridRef}
            className={`grid md:grid-cols-2 gap-6 mb-12 transition-all duration-1000 ${
              gridInView 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="p-6 bg-accent/50 rounded-lg border border-border hover-scale transition-all">
              <h3 className="font-semibold text-lg mb-2">Dados Oficiais</h3>
              <p className="text-muted-foreground">
                Baseado em informações oficiais do governo canadense
              </p>
            </div>
            <div className="p-6 bg-accent/50 rounded-lg border border-border hover-scale transition-all">
              <h3 className="font-semibold text-lg mb-2">Atualizações Constantes</h3>
              <p className="text-muted-foreground">
                Sistema sincronizado com os draws mais recentes
              </p>
            </div>
            <div className="p-6 bg-accent/50 rounded-lg border border-border hover-scale transition-all">
              <h3 className="font-semibold text-lg mb-2">Simulações Inteligentes</h3>
              <p className="text-muted-foreground">
                Teste diferentes cenários e otimize sua estratégia
              </p>
            </div>
            <div className="p-6 bg-accent/50 rounded-lg border border-border hover-scale transition-all">
              <h3 className="font-semibold text-lg mb-2">Interface Intuitiva</h3>
              <p className="text-muted-foreground">
                Fácil de usar, mesmo para iniciantes
              </p>
            </div>
          </div>

          <div
            ref={ctaRef}
            className={`transition-all duration-1000 ${
              ctaInView 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            <Button asChild size="lg" variant="canadian" className="text-lg group">
              <Link to="/auth">
                Criar Conta Gratuita
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">O Que Nossos Usuários Dizem</h2>
            <p className="text-xl text-muted-foreground">
              Histórias reais de pessoas que usaram nossas ferramentas
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {/* Testimonial 1 */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="hover-scale transition-all h-full">
                  <CardHeader>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                    <CardTitle className="text-lg">Ferramenta Essencial</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      A calculadora CRS e as simulações me ajudaram a entender exatamente o que preciso melhorar. 
                      Consegui aumentar minha pontuação de 420 para 480 em 6 meses seguindo as recomendações!
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Maria Silva</span>
                      <span className="text-muted-foreground">Mar 15, 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Testimonial 2 */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="hover-scale transition-all h-full">
                  <CardHeader>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                    <CardTitle className="text-lg">Dados Confiáveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Finalmente encontrei uma plataforma que mostra os draws do Express Entry de forma clara e atualizada. 
                      Os gráficos me ajudaram a entender as tendências e planejar melhor minha aplicação.
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">João Santos</span>
                      <span className="text-muted-foreground">Fev 28, 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Testimonial 3 */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="hover-scale transition-all h-full">
                  <CardHeader>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                    <CardTitle className="text-lg">Muito Útil</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      O quiz de imigração me deu uma direção clara sobre qual programa seguir. 
                      Antes estava perdida com tantas opções, agora sei exatamente o que fazer. Recomendo muito!
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Ana Costa</span>
                      <span className="text-muted-foreground">Jan 10, 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Testimonial 4 */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="hover-scale transition-all h-full">
                  <CardHeader>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                    <CardTitle className="text-lg">Mudou Minha Estratégia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Com as simulações, percebi que melhorar meu francês seria mais rápido do que esperar por mais experiência. 
                      Fui de 440 para 510 pontos em apenas 4 meses! Incrível!
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Pedro Oliveira</span>
                      <span className="text-muted-foreground">Abr 02, 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Testimonial 5 */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="hover-scale transition-all h-full">
                  <CardHeader>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                    <CardTitle className="text-lg">Interface Perfeita</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Muito intuitivo e fácil de usar. Testei várias calculadoras CRS, mas essa é disparada a melhor. 
                      O histórico de pontuações me ajuda a acompanhar meu progresso ao longo do tempo.
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Carla Mendes</span>
                      <span className="text-muted-foreground">Mar 20, 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>

              {/* Testimonial 6 */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <Card className="hover-scale transition-all h-full">
                  <CardHeader>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                    <CardTitle className="text-lg">Informação Sempre Atualizada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      Receber alertas dos draws do Express Entry em tempo real faz toda a diferença. 
                      Consegui aplicar logo após um draw com score próximo ao meu. Valeu muito a pena!
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Rafael Lima</span>
                      <span className="text-muted-foreground">Fev 14, 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-canadian text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Junte-se a milhares de pessoas que já estão planejando sua imigração para o Canadá
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline" className="text-lg bg-white text-primary hover:bg-white/90">
              <Link to="/crs-calculator">Calcular Minha Pontuação</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="text-lg">
              <a href="/quiz">Fazer Quiz Gratuito</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
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
            <p className="text-xs text-muted-foreground">© 2025 Canada Immigration Platform. Baseado em dados oficiais do governo canadense.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;
