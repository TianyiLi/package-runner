import { createFileRoute } from '@tanstack/react-router';
import { MonitoringTab } from '@/components/tabs/MonitoringTab';

export const Route = createFileRoute('/_layout/monitoring')({
  component: MonitoringTab,
});