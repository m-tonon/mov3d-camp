'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { AdminLogoMark } from '@/components/admin/admin-logo-mark';
import {
  resolveRedirectPath,
  setAdminSession,
  type AdminRole,
} from '@/lib/admin-session';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = (await res.json()) as {
      success?: boolean;
      role?: AdminRole;
    };

    if (data.success && data.role) {
      setAdminSession(data.role);
      const redirectTo = resolveRedirectPath(
        searchParams.get('from'),
        data.role,
      );
      router.push(redirectTo);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <AdminLogoMark size="lg" className="mx-auto" />
          <h1 className="text-xl font-black tracking-tight">Mov3D Admin</h1>
          <p className="text-xs text-muted-foreground">
            Digite a senha para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="••••••••"
                autoFocus
                className={`w-full bg-background border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/40 transition-all ${
                  error
                    ? 'border-destructive/60 bg-destructive/5'
                    : 'border-border'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-xs text-destructive mt-1.5">
                Senha incorreta.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
