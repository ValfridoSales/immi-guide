import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion, TrendingUp, Calculator } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

export const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
              Guia Canadá
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/">
                <FileQuestion className="w-4 h-4 mr-2" />
                Quiz de Imigração
              </Link>
            </Button>
            
            <Button
              variant={location.pathname === '/express-entry/draws' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/express-entry/draws">
                <TrendingUp className="w-4 h-4 mr-2" />
                Express Entry Draws
              </Link>
            </Button>
            
            <Button
              variant={location.pathname === '/crs-calculator' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/crs-calculator">
                <Calculator className="w-4 h-4 mr-2" />
                Calculadora CRS
              </Link>
            </Button>
            
            <div className="border-l border-border pl-4 h-8 flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};