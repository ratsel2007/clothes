import { AppShell } from '@mantine/core';
import { Header } from './Header';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <AppShell header={{ height: 60 }}>
      <Header />
      <AppShell.Main p="md">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
