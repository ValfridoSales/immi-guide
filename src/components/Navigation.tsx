import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { useState } from 'react';
export const Navigation = ({
  fixed = false,
  transparent = false
}: {
  fixed?: boolean;
  transparent?: boolean;
}) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navLinks = [{
    label: 'Tools',
    path: '/crs-calculator'
  }, {
    label: 'Pricing',
    path: '/pricing'
  }, {
    label: 'Support',
    path: '/quiz'
  }];
  return <nav className={`${fixed ? 'fixed top-0 left-0 right-0 z-50' : ''} ${transparent ? 'bg-transparent' : 'bg-dark-brown'}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-display text-dark-brown-foreground text-[#55524e] font-semibold pl-[60px]">
              Guide Canada
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => <Link key={link.path} to={link.path} className={`text-sm font-display font-medium text-[#54514D] hover:text-[#54514D]/80 transition-colors`} onClick={() => setOpen(false)}>
                {link.label}
              </Link>)}
            <Button asChild size="sm" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 px-6">
              <Link to="/auth">Try for free</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <UserMenu />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-dark-brown-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-dark-brown border-dark-brown">
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map(link => <Link key={link.path} to={link.path} className="text-dark-brown-foreground/80 hover:text-dark-brown-foreground font-medium" onClick={() => setOpen(false)}>
                      {link.label}
                    </Link>)}
                  <Button asChild className="rounded-none bg-primary text-primary-foreground">
                    <Link to="/auth" onClick={() => setOpen(false)}>Try for free</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>;
};