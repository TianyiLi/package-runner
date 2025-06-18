import { createFileRoute } from '@tanstack/react-router';
import { EnvironmentTab } from '@/components/tabs/EnvironmentTab';

export const Route = createFileRoute('/_layout/environment')({
  component: EnvironmentTab,
});