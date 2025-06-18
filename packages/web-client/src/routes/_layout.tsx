import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Sidebar } from '@/components/layout/Sidebar';

export const Route = createFileRoute('/_layout')({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
