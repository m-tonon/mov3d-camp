"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-session";

function isAdminLoginPath(pathname: string) {
  return pathname === "/admin/login";
}

function isProtectedAdminPath(pathname: string) {
  if (isAdminLoginPath(pathname)) return false;
  return pathname.startsWith("/admin");
}

export function AdminAuthShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const authenticated = isAdminAuthenticated();

    if (!authenticated && isProtectedAdminPath(pathname)) {
      const from = encodeURIComponent(pathname);
      router.replace(`/admin/login?from=${from}`);
      return;
    }

    setAuthorized(true);
  }, [pathname, router]);

  if (!authorized) return null;

  return <>{children}</>;
}
