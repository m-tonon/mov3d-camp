'use client'

import * as React from 'react'
import { HeroUIProvider } from '@heroui/react'
import { AdminThemeInit } from '@/components/admin/admin-theme-toggle'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AdminThemeInit />
      {children}
    </HeroUIProvider>
  )
}
