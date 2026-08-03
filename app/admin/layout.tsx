import { adminAreaMetadata } from '@/lib/admin-metadata';
import { AdminAuthShell } from '@/components/admin/admin-auth-shell';

export const metadata = adminAreaMetadata;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthShell>{children}</AdminAuthShell>;
}
