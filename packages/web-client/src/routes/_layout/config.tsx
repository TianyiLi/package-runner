import { createFileRoute } from '@tanstack/react-router';
import { ConfigTab } from '@/components/tabs/ConfigTab';

export const Route = createFileRoute('/_layout/config')({
  component: ConfigTab,
});