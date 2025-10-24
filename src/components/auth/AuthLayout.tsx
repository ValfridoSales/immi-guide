import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="inline-block mb-12">
            <div className="text-2xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
              Guia Canadá
            </div>
          </Link>

          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-base lg:text-lg">{subtitle}</p>
            )}
          </div>

          {/* Form Content */}
          {children}

          {/* Back to Home - Mobile */}
          <div className="mt-8 lg:hidden">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Video Background */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-gradient-to-br from-canadian-red to-canadian-red/80">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/auth-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-canadian-red/20 to-transparent mix-blend-overlay" />
      </div>
    </div>
  );
}
