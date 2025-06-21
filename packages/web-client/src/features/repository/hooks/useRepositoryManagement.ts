import { useAtom } from 'jotai';
import { useNavigate } from '@tanstack/react-router';
import { repositoriesAtom, selectedRepositoryAtom } from '@/store/atoms';
import type { Repository } from '../types';

export function useRepositoryManagement() {
  const [repositories, setRepositories] = useAtom(repositoriesAtom);
  const [, setSelectedRepository] = useAtom(selectedRepositoryAtom);
  const navigate = useNavigate();

  const handleSelectRepository = (repo: Repository) => {
    // Update last accessed time
    const updatedRepo = { ...repo, lastAccessed: new Date() };
    setRepositories(prev => 
      prev.map(r => r.id === repo.id ? updatedRepo : r)
    );
    
    setSelectedRepository(updatedRepo);
    navigate({ to: '/scripts' });
  };

  const handleToggleFavorite = (repoId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent repository selection when clicking star
    setRepositories(prev =>
      prev.map(repo =>
        repo.id === repoId ? { ...repo, isFavorite: !repo.isFavorite } : repo
      )
    );
  };

  const addRepository = (newRepo: Repository) => {
    setRepositories(prev => [newRepo, ...prev]);
  };

  const formatLastAccessed = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return {
    repositories,
    setRepositories,
    handleSelectRepository,
    handleToggleFavorite,
    addRepository,
    formatLastAccessed
  };
} 