import { MapPin, Users, TrendingUp, Award } from 'lucide-react';

export function AuthSidebar() {
  const stats = [
    { icon: Users, value: '12.000+', label: 'Usuários ativos' },
    { icon: TrendingUp, value: '98%', label: 'Taxa de precisão' },
    { icon: Award, value: '#1', label: 'Mais confiável' },
  ];

  const testimonials = [
    {
      quote: 'Consegui aumentar meu CRS em 67 pontos usando as simulações!',
      author: 'Maria Silva',
      role: 'PRO Member',
    },
    {
      quote: 'A melhor ferramenta para acompanhar os draws do Express Entry.',
      author: 'João Santos',
      role: 'FREE Member',
    },
    {
      quote: 'Recebi meu ITA em apenas 3 meses seguindo as orientações!',
      author: 'Ana Costa',
      role: 'PRO Member',
    },
  ];

  return (
    <div className="hidden lg:flex lg:flex-1 bg-gradient-canadian text-white p-12 flex-col justify-between relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <MapPin className="h-8 w-8" />
          <h2 className="text-3xl font-bold">Guia Canadá</h2>
        </div>

        <h3 className="text-4xl font-bold mb-4 leading-tight">
          Sua jornada para o Canadá começa aqui
        </h3>
        <p className="text-white/90 text-lg leading-relaxed">
          Ferramentas precisas e dados oficiais para transformar seu sonho canadense em realidade.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-6 my-12">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all"
          >
            <stat.icon className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-white/80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Testimonials Carousel */}
      <div className="relative z-10">
        <h4 className="text-sm font-semibold mb-4 text-white/80">
          O que nossos usuários dizem
        </h4>
        <div className="space-y-4">
          {testimonials.slice(0, 2).map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
            >
              <p className="text-sm mb-2 italic">"{testimonial.quote}"</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{testimonial.author}</span>
                <span className="text-xs text-white/70">{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
