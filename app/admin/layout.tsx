import { adminAreaMetadata } from '@/lib/admin-metadata';
import { AdminAuthShell } from '@/components/admin/admin-auth-shell';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export const metadata = adminAreaMetadata;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthShell>
      <div className="min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="p-6 lg:p-0">{children}</div>
        </main>
      </div>
    </AdminAuthShell>
  );
}
