import { createFileRoute } from '@tanstack/react-router';
import { RepositorySelector } from '@/components/repository/RepositorySelector';

export const Route = createFileRoute('/_layout/repositories')({
  component: RepositorySelector,
});