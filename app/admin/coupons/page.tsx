'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  RefreshCw,
  Tag,
  Percent,
  Loader2,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { AdminThemeToggle } from '@/components/admin/admin-theme-toggle';
import { AdminBackToRegistration } from '@/components/admin/admin-back-to-registration';

interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  usageCount: number;
  usageLimit: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newUsageLimit, setNewUsageLimit] = useState('');
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  const closeModals = () => {
    setShowCreateModal(false);
    setDeletingCode(null);
    setAdminPassword('');
    setNewCode('');
    setNewDiscount('');
    setNewUsageLimit('');
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao carregar cupons');
      }
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
      toast.error('Falha ao carregar cupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!newCode.trim() || !newDiscount) {
      toast.error('Preencha código e porcentagem');
      return;
    }

    const discount = parseInt(newDiscount, 10);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      toast.error('Porcentagem deve ser entre 1 e 100');
      return;
    }

    const usageLimit = newUsageLimit ? parseInt(newUsageLimit, 10) : null;
    if (usageLimit !== null && (isNaN(usageLimit) || usageLimit < 1)) {
      toast.error('Limite de uso deve ser um número positivo');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim(),
          discountPercentage: discount,
          usageLimit,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar cupom');
      }
      toast.success('Cupom criado com sucesso!');
      closeModals();
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar cupom');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCode || !adminPassword) return;

    try {
      const res = await fetch(`/api/admin/coupons/${deletingCode}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao excluir cupom');
      }
      toast.success('Cupom excluído com sucesso.');
      closeModals();
      fetchCoupons();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar';
      toast.error(message);
    }
  };

  const formatUsage = (coupon: Coupon) => {
    if (coupon.usageLimit === null) return `${coupon.usageCount} / ∞`;
    return `${coupon.usageCount} / ${coupon.usageLimit}`;
  };

  const isDeletable = (coupon: Coupon) => coupon.usageCount === 0;

  return (
    <div className="p-6 space-y-6">
      {/* Mobile actions */}
      <div className="flex sm:hidden items-center justify-between gap-3 pb-4 border-b border-border">
        <AdminThemeToggle showLabel />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCoupons}
            className="flex items-center justify-center size-9 rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <AdminBackToRegistration />
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Cupons de Desconto
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gerencie cupons para o IPVO Acampa Jovens
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <AdminThemeToggle />
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Content wrapper with max width */}
      <div className="max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Total de Cupons
            </p>
            <p className="text-2xl font-black tracking-tight text-foreground">
              {coupons.length}
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Total de Usos
            </p>
            <p className="text-2xl font-black tracking-tight text-foreground">
              {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Ativos (com limite disponível)
            </p>
            <p className="text-2xl font-black tracking-tight text-foreground">
              {coupons.filter((c) => c.usageLimit === null || c.usageCount < c.usageLimit).length}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-6 bg-card border border-border rounded-2xl overflow-hidden"
      >
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Cupom</span>
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground text-sm">
            Nenhum cupom cadastrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    Código
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    Desconto
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-36">
                    Usos / Limite
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      Criado em
                    </span>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((coupon, i) => {
                  const isActive = coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit;
                  return (
                    <motion.tr
                      key={coupon._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-foreground tabular-nums">
                        {coupon.code}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                        {coupon.discountPercentage}%
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                        {formatUsage(coupon)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                          {isActive ? 'Ativo' : 'Esgotado'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(coupon.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {!isDeletable(coupon) && (
                            <button
                              disabled
                              title="Não é possível excluir cupom já utilizado"
                              className="p-1.5 rounded-lg border border-border bg-muted/30 text-muted-foreground opacity-60 cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isDeletable(coupon) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingCode(coupon.code);
                                setAdminPassword('');
                              }}
                              title="Excluir cupom"
                              className="p-1.5 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors text-destructive cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Total de <span className="text-foreground font-medium">{coupons.length}</span> cupons
            </p>
          </div>
        )}
      </motion.div>

      </div>

      {/* Toaster and Modals */}
      <Toaster position="top-right" richColors />

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-card/85 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden"
          >
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Criar Cupom</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Crie um novo cupom de desconto para os participantes.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Código do Cupom
                </label>
                <input
                  type="text"
                  placeholder="Ex: VIP20, DESCONTO10"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/45 text-uppercase"
                  maxLength={20}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Porcentagem de Desconto (%)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 10"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/45"
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Limite de Usos (opcional)
                </label>
                <input
                  type="number"
                  placeholder="Deixe vazio para ilimitado"
                  value={newUsageLimit}
                  onChange={(e) => setNewUsageLimit(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/45"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Quantas vezes este cupom pode ser usado. Vazio = ilimitado.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newCode.trim() || !newDiscount}
                  className={`flex-1 px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer bg-primary hover:opacity-90`}
                >
                  {creating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Criar'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-card/85 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Excluir Cupom</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Tem certeza que deseja excluir o cupom <strong>{deletingCode}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Senha de Autorização
                </label>
                <input
                  type="password"
                  placeholder="Digite a senha..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/45"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDelete();
                  }}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!adminPassword}
                  className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}