import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  TrendingUp,
  Target,
  Bell,
  FileText,
  Settings,
  CreditCard,
  ClipboardList,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/quiz-results', label: 'Meus Resultados', icon: ClipboardList, pro: true },
  { href: '/dashboard/crs-history', label: 'Histórico CRS', icon: TrendingUp, pro: true },
  { href: '/dashboard/simulations', label: 'Simulações', icon: Target, pro: true },
  { href: '/dashboard/reports', label: 'Relatórios', icon: FileText, pro: true },
  { href: '/dashboard/alerts', label: 'Alertas', icon: Bell, pro: true },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
  { href: '/dashboard/subscription', label: 'Assinatura', icon: CreditCard },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 px-3">Dashboard</h2>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                    {link.pro && (
                      <span className="ml-auto text-xs bg-gradient-canadian text-white px-1.5 py-0.5 rounded">
                        PRO
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
