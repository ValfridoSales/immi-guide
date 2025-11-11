import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FileQuestion, TrendingUp, Calculator, Menu } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { useState } from 'react';

export const Navigation = ({ fixed = false }: { fixed?: boolean }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  const NavLinks = () => (
    <>
      <Button
        variant={location.pathname === '/quiz' ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={() => setOpen(false)}
      >
        <Link to="/quiz">
          <FileQuestion className="w-4 h-4 mr-2" />
          Quiz de Imigração
        </Link>
      </Button>
      
      <Button
        variant={location.pathname === '/crs-calculator' ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={() => setOpen(false)}
      >
        <Link to="/crs-calculator">
          <Calculator className="w-4 h-4 mr-2" />
          Calculadora CRS
        </Link>
      </Button>
      
      <Button
        variant={location.pathname === '/express-entry/draws' ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={() => setOpen(false)}
      >
        <Link to="/express-entry/draws">
          <TrendingUp className="w-4 h-4 mr-2" />
          Express Entry Draws
        </Link>
      </Button>
    </>
  );
  
  return (
    <nav className={`border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${fixed ? 'fixed top-0 left-0 right-0 z-50' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-canadian bg-clip-text text-transparent">
              Guia Canadá
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavLinks />
            <div className="border-l border-border pl-4 h-8 flex items-center">
              <UserMenu />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <UserMenu />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};