import { createFileRoute } from '@tanstack/react-router';
import { ScriptsTab } from '@/components/tabs/ScriptsTab';

export const Route = createFileRoute('/_layout/scripts')({
  component: ScriptsTab,
});