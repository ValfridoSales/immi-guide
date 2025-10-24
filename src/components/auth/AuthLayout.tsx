import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AuthSidebar } from './AuthSidebar';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Only visible on mobile */}
      <nav className="lg:hidden border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
                Guia Canadá
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Two Column Layout */}
      <main className="flex-1 flex">
        {/* Left Sidebar - Hidden on mobile */}
        <AuthSidebar />

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="w-full max-w-md">
            <div className="bg-card rounded-xl border border-border shadow-xl p-8 lg:p-10 animate-fade-in">
              {/* Logo for Desktop */}
              <Link to="/" className="hidden lg:block mb-8">
                <div className="text-2xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
                  Guia Canadá
                </div>
              </Link>

              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">{title}</h1>
                {subtitle && (
                  <p className="text-muted-foreground text-sm lg:text-base">{subtitle}</p>
                )}
              </div>
              {children}
            </div>

            {/* Back to Home - Mobile */}
            <div className="mt-6 text-center lg:hidden">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
