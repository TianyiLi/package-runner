import { createFileRoute } from '@tanstack/react-router';
import { EditorTab } from '@/components/tabs/EditorTab';

export const Route = createFileRoute('/_layout/editor')({
  component: EditorTab,
});