'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
  Copy,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { AdminThemeToggle } from '@/components/admin/admin-theme-toggle';
import { AdminBackToRegistration } from '@/components/admin/admin-back-to-registration';

interface Registration {
  _id: string;
  registrationNumber?: number;
  name: string;
  age: number;
  gender: string;
  whatsapp?: string;
  churchName: string;
  responsibleInfo: {
    name: string;
    phone: string;
    email: string;
  };
  payment: {
    paymentConfirmed: boolean;
    referenceId: string;
    amount: number;
    paymentLink?: string;
  };
  accommodationType?: string;
  isSuiteRegistration?: boolean;
  suiteRole?: 'payer' | 'partner';
  suitePayerRegistrationNumber?: number | null;
  suitePartnerRegistrationNumber?: number | null;
  suiteGroupNumber?: number | null;
  suiteMembers?: string;
  suiteDisplayTitle?: string;
  createdAt: string;
}

type PaymentFilter = 'all' | 'paid' | 'pending';
type SortField = 'registrationNumber' | 'name' | 'age' | 'createdAt';
type SortDir = 'asc' | 'desc';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-black tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('registrationNumber');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [exporting, setExporting] = useState(false);
  const [genderFilter, setGenderFilter] = useState<
    'all' | 'Masculino' | 'Feminino'
  >('all');

  const [confirmingRegId, setConfirmingRegId] = useState<string | null>(null);
  const [confirmingTargetStatus, setConfirmingTargetStatus] = useState<boolean>(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmingLoading, setConfirmingLoading] = useState(false);

  const confirmRegistration = async () => {
    if (!confirmingRegId || !adminPassword) return;
    setConfirmingLoading(true);
    try {
      const res = await fetch('/api/registration/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: confirmingRegId,
          password: adminPassword,
          confirmed: confirmingTargetStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar inscrição');
      }
      toast.success(confirmingTargetStatus ? 'Inscrição confirmada com sucesso!' : 'Inscrição alterada para pendente!');
      setConfirmingRegId(null);
      setAdminPassword('');
      fetchRegistrations();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar');
    } finally {
      setConfirmingLoading(false);
    }
  };

  const copyPaymentUrl = (paymentLink?: string) => {
    if (!paymentLink) {
      toast.error('Link de pagamento não disponível.');
      return;
    }
    navigator.clipboard.writeText(paymentLink);
    toast.success('Link de pagamento copiado!');
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/registration/export');
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        const message =
          typeof data?.error === 'string'
            ? data.error
            : 'Falha ao carregar inscrições';
        toast.error(message);
        setRegistrations([]);
        return;
      }
      setRegistrations(data);
    } catch (err) {
      console.error('Failed to fetch registrations', err);
      toast.error('Falha ao carregar inscrições');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filtered = registrations
    .filter((r) => {
      if (filter === 'paid') return r.payment?.paymentConfirmed === true;
      if (filter === 'pending') return r.payment?.paymentConfirmed === false;
      return true;
    })
    .filter((r) => {
      if (genderFilter !== 'all') return r.gender === genderFilter;
      return true;
    })
    .filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.name?.toLowerCase().includes(q) ||
        r.responsibleInfo?.name?.toLowerCase().includes(q) ||
        r.churchName?.toLowerCase().includes(q) ||
        r.whatsapp?.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        r.payment?.referenceId?.toLowerCase().includes(q) ||
        String(r.registrationNumber ?? '').includes(q)
      );
    })
    .sort((a, b) => {
      if (sortField === 'registrationNumber') {
        const numA = a.registrationNumber ?? Number.MAX_SAFE_INTEGER;
        const numB = b.registrationNumber ?? Number.MAX_SAFE_INTEGER;
        if (numA < numB) return sortDir === 'asc' ? -1 : 1;
        if (numA > numB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }
      let valA: any = a[sortField as keyof Registration];
      let valB: any = b[sortField as keyof Registration];
      if (sortField === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const total = registrations.length;
  const paid = registrations.filter((r) => r.payment?.paymentConfirmed).length;
  const pending = total - paid;

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-primary" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary" />
    );
  };

  const handleExport = (paymentOnly: boolean) => {
    const url = `/api/registration/export?csv=1${paymentOnly ? '&paid=true' : ''}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscricoes-acampa-${Date.now()}.csv`;
    a.click();
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '—';
    const d = phone.replace(/\D/g, '');
    if (d.length === 11)
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    return phone;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Mobile actions */}
      <div className="flex sm:hidden items-center justify-between gap-3 pb-4 border-b border-border">
        <AdminThemeToggle showLabel />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRegistrations}
            className="flex items-center justify-center size-9 rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Atualizar"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={() => handleExport(false)}
            disabled={exporting}
            className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            aria-label="Exportar CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <AdminBackToRegistration />
          <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Inscrições
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            IPVO Acampa Jovens · 05–07 Junho 2026
          </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <AdminThemeToggle />
          <button
            onClick={fetchRegistrations}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => handleExport(false)}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total"
          value={total}
          color="bg-primary/10 text-primary"
          delay={0}
        />
        <StatCard
          icon={CheckCircle}
          label="Confirmados"
          value={paid}
          color="bg-green-500/10 text-green-400"
          delay={0.05}
        />
        <StatCard
          icon={Clock}
          label="Pendentes"
          value={pending}
          color="bg-amber-500/10 text-amber-400"
          delay={0.1}
        />
      </div>

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por #, nome, igreja, ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-background border border-border rounded-lg p-0.5 text-xs">
              {(['all', 'paid', 'pending'] as PaymentFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    filter === f
                      ? f === 'paid'
                        ? 'bg-green-500/20 text-green-400'
                        : f === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagos' : 'Pendentes'}
                </button>
              ))}
            </div>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Todos gêneros</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground text-sm">
            Nenhuma inscrição encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors w-16"
                    onClick={() => handleSort('registrationNumber')}
                  >
                    <span className="flex items-center gap-1">
                      # <SortIcon field="registrationNumber" />
                    </span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <span className="flex items-center gap-1">
                      Nome <SortIcon field="name" />
                    </span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('age')}
                  >
                    <span className="flex items-center gap-1">
                      Idade <SortIcon field="age" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Gênero
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Acomodação
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
                    Suíte
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ref. pagamento
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Igreja
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <span className="flex items-center gap-1">
                      Data <SortIcon field="createdAt" />
                    </span>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((reg, i) => {
                  const isSuitePartner = reg.suiteRole === 'partner';
                  const isSuitePayer = reg.suiteRole === 'payer';
                  const inSuite = Boolean(reg.suiteDisplayTitle);

                  return (
                  <motion.tr
                    key={reg._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className={`hover:bg-muted/30 transition-colors ${
                      !reg.payment?.paymentConfirmed ? 'opacity-60' : ''
                    } ${
                      isSuitePartner
                        ? 'border-l-[3px] border-l-violet-600 bg-violet-100/70 dark:border-l-violet-400 dark:bg-violet-500/10'
                        : isSuitePayer
                          ? 'border-l-[3px] border-l-violet-500 bg-violet-50 dark:border-l-violet-500/55 dark:bg-violet-500/[0.06]'
                          : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-foreground tabular-nums">
                      {reg.registrationNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {reg.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {reg.age ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${reg.gender === 'Feminino' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'}`}
                      >
                        {reg.gender || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          reg.accommodationType === 'Suíte'
                            ? 'bg-violet-100 text-violet-900 ring-1 ring-violet-200 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-0'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400'
                        }`}
                      >
                        {reg.accommodationType || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {inSuite ? (
                        <span
                          className={`inline-flex max-w-[220px] flex-col gap-1 rounded-lg px-2.5 py-1.5 font-semibold leading-snug ring-1 ring-inset ${
                            isSuitePartner
                              ? 'bg-violet-200/60 text-violet-950 ring-violet-300/70 dark:bg-violet-500/20 dark:text-violet-100 dark:ring-violet-400/25'
                              : 'bg-violet-100 text-violet-900 ring-violet-200 dark:bg-purple-500/15 dark:text-purple-200 dark:ring-purple-400/20'
                          }`}
                        >
                          <span>{reg.suiteDisplayTitle}</span>
                          <span className="text-[10px] font-normal text-violet-800 dark:text-violet-200/90">
                            {reg.suiteMembers}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground max-w-[120px] truncate" title={reg.payment?.referenceId}>
                      {reg.payment?.referenceId || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {reg.churchName || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {reg.responsibleInfo?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      <div className="font-mono whitespace-nowrap">
                        {formatPhone(reg.whatsapp ?? '')}
                      </div>
                      {reg.responsibleInfo?.phone && (
                        <div className="text-[10px] text-muted-foreground/80 mt-0.5 whitespace-nowrap">
                          Resp.: {formatPhone(reg.responsibleInfo.phone)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${reg.payment?.paymentConfirmed ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${reg.payment?.paymentConfirmed ? 'bg-green-400' : 'bg-amber-400'}`}
                        />
                        {reg.payment?.paymentConfirmed
                          ? 'Confirmado'
                          : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {reg.createdAt
                        ? new Date(reg.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {reg.payment?.paymentLink && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyPaymentUrl(reg.payment.paymentLink);
                            }}
                            title="Copiar link de pagamento"
                            className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!reg.payment?.paymentConfirmed ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingRegId(reg._id);
                              setConfirmingTargetStatus(true);
                            }}
                            title="Confirmar pagamento manualmente"
                            className="p-1.5 rounded-lg border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors text-green-400 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingRegId(reg._id);
                              setConfirmingTargetStatus(false);
                            }}
                            title="Marcar como pendente (estornar)"
                            className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-amber-400 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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
              Mostrando{' '}
              <span className="text-foreground font-medium">
                {filtered.length}
              </span>{' '}
              de <span className="text-foreground font-medium">{total}</span>{' '}
              inscrições
            </p>
            <button
              onClick={() => handleExport(filter === 'paid')}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <Download className="w-3 h-3" />
              Exportar filtro atual
            </button>
          </div>
        )}
      </motion.div>

      {/* Toaster and Confirmation Modal */}
      <Toaster position="top-right" richColors />

      {confirmingRegId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-card/85 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-full ${confirmingTargetStatus ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {confirmingTargetStatus ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <RotateCcw className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {confirmingTargetStatus ? 'Confirmar Pagamento' : 'Marcar como Pendente'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {confirmingTargetStatus
                    ? 'Esta ação confirmará manualmente o pagamento do acampante. Digite a senha de autorização para prosseguir.'
                    : 'Esta ação reverterá o pagamento do acampante para pendente. Digite a senha de autorização para prosseguir.'}
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
                    if (e.key === 'Enter') confirmRegistration();
                  }}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setConfirmingRegId(null);
                    setAdminPassword('');
                  }}
                  className="flex-1 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRegistration}
                  disabled={confirmingLoading || !adminPassword}
                  className={`flex-1 px-4 py-2 text-xs font-semibold rounded-lg text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${
                    confirmingTargetStatus
                      ? 'bg-green-500 hover:bg-green-400'
                      : 'bg-amber-500 hover:bg-amber-400'
                  }`}
                >
                  {confirmingLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    'Confirmar'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
