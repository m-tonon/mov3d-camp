'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Users, Tag, LayoutDashboard, Menu, X, ChevronRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return null;
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    {
      href: '/admin',
      label: 'Inscrições',
      icon: Users,
      description: 'Gerenciar inscrições',
    },
    {
      href: '/admin/coupons',
      label: 'Cupons',
      icon: Tag,
      description: 'Gerenciar cupons de desconto',
    },
  ];

  const handleNavClick = (href: string) => {
    router.push(href);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          isMobile && !isMobileOpen && '-translate-x-full',
          isMobile && isMobileOpen && 'translate-x-0',
          className
        )}
        aria-label="Navegação administrativa"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-bold text-lg text-foreground"
              onClick={() => handleNavClick('/admin')}
            >
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
            {/* Mobile close button */}
            {isMobile && isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors lg:hidden"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Menu principal">
            {navItems.map((item) => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left',
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-transparent'
                  )}
                  title={item.description}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </nav>

{/* Footer */}
          <div className="border-t border-border p-4">
            <a
              href="/registration"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
            >
              <Globe className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Ver site público</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button - only shown when sidebar is closed on mobile */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Abrir menu"
          aria-expanded="false"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
}