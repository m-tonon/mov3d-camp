'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'ipvo-app-theme';

function applyDocumentTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}

export function AdminThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isDark = stored ? stored === 'dark' : true;
    applyDocumentTheme(isDark);
  }, []);

  return null;
}

export function AdminThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isDark = stored ? stored === 'dark' : true;
    applyDocumentTheme(isDark);
    setDark(isDark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    applyDocumentTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!mounted}
      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
      aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      {mounted ? (
        dark ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )
      ) : (
        <span className="w-3.5 h-3.5" />
      )}
      <span className={showLabel ? 'inline' : 'hidden sm:inline'}>
        {dark ? 'Claro' : 'Escuro'}
      </span>
    </button>
  );
}
