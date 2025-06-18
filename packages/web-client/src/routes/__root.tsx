import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="system" storageKey="package-manager-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <Outlet />
        <Toaster richColors position="top-right" />
      </div>
      <TanStackRouterDevtools />
    </ThemeProvider>
  ),
});