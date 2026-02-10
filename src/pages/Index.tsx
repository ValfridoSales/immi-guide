import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import heroImage from '@/assets/homepage-hero.jpg';
import snowWomanImage from '@/assets/homepage-snow-woman.jpg';
import passportImage from '@/assets/homepage-passport.png';
const testimonials = [{
  quote: "A calculadora CRS e as simulações me ajudaram a entender exatamente o que preciso melhorar. Consegui aumentar minha pontuação de 420 para 480 em 6 meses seguindo as recomendações!",
  name: "Maria Silva",
  role: "Software Engineer, São Paulo"
}, {
  quote: "Finalmente encontrei uma plataforma que mostra os draws do Express Entry de forma clara e atualizada. Os gráficos me ajudaram a entender as tendências.",
  name: "João Santos",
  role: "Product Manager, Lisboa"
}, {
  quote: "O quiz de imigração me deu uma direção clara sobre qual programa seguir. Antes estava perdida com tantas opções, agora sei exatamente o que fazer.",
  name: "Ana Costa",
  role: "Designer, Rio de Janeiro"
}];
const comparisonData = [{
  task: "Eligibility Assessment",
  guideCanada: "3-minute quiz",
  onYourOwn: "Hours of research"
}, {
  task: "CRS Score Calculation",
  guideCanada: "Instant & accurate",
  onYourOwn: "Manual & error-prone"
}, {
  task: "Draw Monitoring",
  guideCanada: "Real-time alerts",
  onYourOwn: "Check manually daily"
}, {
  task: "Score Improvement Plan",
  guideCanada: "AI-powered simulations",
  onYourOwn: "Trial and error"
}, {
  task: "Program Matching",
  guideCanada: "Personalized results",
  onYourOwn: "Compare 80+ programs"
}, {
  task: "Progress Tracking",
  guideCanada: "Visual dashboard",
  onYourOwn: "Spreadsheets"
}, {
  task: "Expert Guidance",
  guideCanada: "Built-in recommendations",
  onYourOwn: "Expensive consultants"
}];
const faqItems = [{
  question: "What is the CRS score and why does it matter?",
  answer: "The Comprehensive Ranking System (CRS) score determines your ranking in the Express Entry pool. Higher scores increase your chances of receiving an Invitation to Apply (ITA) for permanent residency in Canada."
}, {
  question: "How accurate is your CRS calculator?",
  answer: "Our calculator follows the exact same methodology used by Immigration, Refugees and Citizenship Canada (IRCC). It's regularly updated to reflect any changes in the scoring system."
}, {
  question: "Is the immigration quiz really free?",
  answer: "Yes! The immigration quiz is completely free with no hidden fees. You'll get personalized program recommendations and actionable next steps in just 3 minutes."
}, {
  question: "How often are Express Entry draws updated?",
  answer: "We sync draw data directly from the official IRCC source. New draws are typically reflected on our platform within minutes of being published."
}, {
  question: "Can I improve my CRS score?",
  answer: "Absolutely. Our simulation tools let you model different scenarios — like improving language scores, gaining more work experience, or getting a provincial nomination — so you can see exactly how each change impacts your score."
}];
const Index = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const nextTestimonial = () => setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  return <div className="min-h-screen bg-background">
      <Navigation fixed />
      <div className="pt-16">

        {/* Section 1: Hero */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          <img src={heroImage} alt="Couple overlooking Canadian mountains" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-dark-brown/60" />
          <div className="relative z-10 container mx-auto px-4 max-w-6xl">
            <div className="max-w-2xl">
              <h1 className="font-display text-5xl md:text-7xl text-white mb-6 leading-tight">
                Acelere o seu plano Canadá
              </h1>
              <p className="text-lg md:text-xl text-white/85 mb-10 leading-relaxed">
                Find the right immigration pathway, and track your progress toward permanent residency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base">
                  <Link to="/auth">Começar Agora</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 text-base border-primary text-primary bg-transparent">
                  <Link to="/crs-calculator">Calcular CRS</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Services */}
        <section className="py-24 px-4 bg-background">
          <div className="container mx-auto max-w-6xl space-y-24">
            {/* Block 1: Text left + Image right */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-6">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Services</span>
                <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
                  Discover your ideal program in just 3 minutes
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our AI-powered quiz analyzes your profile and matches you with the best Canadian immigration programs — personalized, fast, and free.
                </p>
                <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  <Link to="/quiz">
                    Start Your Journey
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="lg:w-1/2">
                <img src={snowWomanImage} alt="Woman enjoying Canadian winter" className="w-full h-[500px] object-cover rounded-2xl shadow-elevated" />
              </div>
            </div>

            {/* Block 2: Image left + Text right */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="lg:w-1/2 space-y-6">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Services</span>
                <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
                  Track your path to Canadian PR
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Calculate your CRS score, monitor Express Entry draws in real-time, and simulate scenarios to maximize your chances of getting an ITA.
                </p>
                <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  <Link to="/crs-calculator">
                    Start here
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="lg:w-1/2">
                <img src={passportImage} alt="Canadian passport and documents" className="w-full h-[500px] object-cover rounded-2xl shadow-elevated" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: About / Comparison Table */}
        <section className="py-24 px-4 bg-secondary">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <span className="text-sm font-medium text-primary uppercase tracking-widest">About Guide Canada</span>
              <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight max-w-3xl mx-auto">
                We exist to simplify your Canada journey, every step of the way
              </h2>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-5 text-sm font-medium text-muted-foreground">Your Tasks</th>
                      <th className="text-left p-5 text-sm font-medium text-primary">Through Guide Canada</th>
                      <th className="text-left p-5 text-sm font-medium text-muted-foreground">On your own</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, i) => <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="p-5 text-sm font-medium text-foreground">{row.task}</td>
                        <td className="p-5 text-sm text-primary font-medium">{row.guideCanada}</td>
                        <td className="p-5 text-sm text-muted-foreground">{row.onYourOwn}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Testimonials */}
        <section className="py-24 px-4 bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16">
              <div className="space-y-2">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Testimonial</span>
                <span className="inline-block ml-4 px-4 py-1 bg-secondary text-foreground text-sm rounded-full">
                  What they say about us
                </span>
              </div>
              <div className="flex gap-3 mt-6 md:mt-0">
                <button onClick={prevTestimonial} className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Previous testimonial">
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <button onClick={nextTestimonial} className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Next testimonial">
                  <ArrowRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-soft">
              <div className="flex flex-col lg:flex-row gap-10 items-center">
                <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-2xl bg-secondary flex-shrink-0 flex items-center justify-center">
                  <span className="text-5xl font-display text-primary">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 space-y-6">
                  <span className="text-6xl font-display text-primary/20 leading-none">"</span>
                  <p className="text-xl md:text-2xl text-foreground leading-relaxed -mt-8">
                    {testimonials[currentTestimonial].quote}
                  </p>
                  <div>
                    <p className="text-primary font-semibold text-lg">{testimonials[currentTestimonial].name}</p>
                    <p className="text-muted-foreground text-sm">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => <button key={i} onClick={() => setCurrentTestimonial(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentTestimonial ? 'bg-primary' : 'bg-border'}`} aria-label={`Go to testimonial ${i + 1}`} />)}
            </div>
          </div>
        </section>

        {/* Section 5: FAQ */}
        <section className="py-24 px-4 bg-secondary">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-2/5 space-y-4">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Frequently Asked Questions</span>
                <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
                  Questions?<br />Answers.
                </h2>
              </div>
              <div className="lg:w-3/5">
                <Accordion type="single" collapsible className="space-y-3">
                  {faqItems.map((item, i) => <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-6">
                      <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>)}
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: CTA Banner */}
        <section className="py-24 px-4 bg-dark-brown">
          <div className="container mx-auto max-w-4xl text-center space-y-8">
            <h2 className="font-display italic text-4xl md:text-5xl text-dark-brown-foreground leading-tight">
              Ready to Accelerate Your Canada Dream?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base">
                <Link to="/auth">Começar Agora</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-dark-brown-foreground text-dark-brown-foreground hover:bg-dark-brown-foreground/10 px-8 text-base">
                <Link to="/crs-calculator">Calcular CRS</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 7: Footer */}
        <footer className="py-16 px-4 bg-background border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="space-y-4">
                <h3 className="font-display text-2xl text-foreground">Contact us</h3>
                <p className="text-muted-foreground text-sm">
                  We'd love to hear from you. Reach out for any questions about your immigration journey.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Enquiries</h4>
                <p className="text-muted-foreground text-sm">General: hello@guiacanada.com</p>
                <p className="text-muted-foreground text-sm">Recruitment: careers@guiacanada.com</p>
                <p className="text-muted-foreground text-sm">New Business: partners@guiacanada.com</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Links</h4>
                <div className="flex flex-col gap-2">
                  <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">LinkedIn</a>
                  <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Instagram</a>
                  <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Accessibility</a>
                  <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Terms & Privacy</a>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center">
              <p className="text-muted-foreground text-sm">© 2026 Guia Canada Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </div>
    </div>;
};
export default Index;