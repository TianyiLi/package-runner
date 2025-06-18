// File System API type declarations
declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  getFileHandle(name: string): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
}

import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { repositoriesAtom, selectedRepositoryAtom, Repository } from '@/store/atoms';
import { useToast } from '@/hooks/use-toast';

interface BrowseRepositoryOptions {
  autoSelect?: boolean;
  onSuccess?: (repository: Repository) => void;
}

interface BrowseRepositoryResult {
  repository: Repository;
  isNewRepository: boolean;
}

export function useBrowseRepository(options: BrowseRepositoryOptions = {}) {
  const [repositories, setRepositories] = useAtom(repositoriesAtom);
  const [, setSelectedRepository] = useAtom(selectedRepositoryAtom);
  const { toast } = useToast();
  const { autoSelect = false, onSuccess } = options;

  // Helper functions
  const checkFileSystemAPISupport = () => {
    return 'showDirectoryPicker' in window;
  };

  const detectProjectType = (packageJson: Record<string, unknown> | null, files: string[]): Repository['type'] => {
    if (!packageJson) return 'node';

    const dependencies = { 
      ...(packageJson.dependencies as Record<string, string> || {}), 
      ...(packageJson.devDependencies as Record<string, string> || {}) 
    };
    
    // Check for specific frameworks
    if (dependencies['next']) return 'next';
    if (dependencies['vite']) return 'vite';
    if (dependencies['react-scripts']) return 'react';
    if (dependencies['react'] && !dependencies['next'] && !dependencies['vite']) return 'react';
    
    // Check for config files
    if (files.includes('vite.config.js') || files.includes('vite.config.ts')) return 'vite';
    if (files.includes('next.config.js') || files.includes('next.config.ts')) return 'next';
    
    return 'node';
  };

  const detectPackageManager = (files: string[]): Repository['packageManager'] => {
    // Prioritize Bun as per cursor rules
    if (files.includes('bun.lockb')) return 'bun';
    if (files.includes('pnpm-lock.yaml')) return 'pnpm';
    if (files.includes('yarn.lock')) return 'yarn';
    return 'npm';
  };

  const readPackageJson = async (dirHandle: FileSystemDirectoryHandle): Promise<Record<string, unknown> | null> => {
    try {
      const packageJsonHandle = await dirHandle.getFileHandle('package.json');
      const file = await packageJsonHandle.getFile();
      const content = await file.text();
      return JSON.parse(content) as Record<string, unknown>;
    } catch (error) {
      console.warn('Could not read package.json:', error);
      return null;
    }
  };

  const getDirectoryFiles = async (dirHandle: FileSystemDirectoryHandle): Promise<string[]> => {
    const files: string[] = [];
    try {
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file') {
          files.push(name);
        }
      }
    } catch (error) {
      console.warn('Could not read directory contents:', error);
    }
    return files;
  };

  const browseRepositoryMutation = useMutation({
    mutationFn: async (): Promise<BrowseRepositoryResult> => {
      if (!checkFileSystemAPISupport()) {
        throw new Error('BROWSER_NOT_SUPPORTED');
      }

      // Show directory picker
      const dirHandle = await window.showDirectoryPicker();
      
      // Get directory name and create a path
      const dirName = dirHandle.name;
      const dirPath = dirName; // In a real app, you might want to show the full path
      
      // Read directory contents
      const files = await getDirectoryFiles(dirHandle);
      
      // Check if it's a valid project (has package.json)
      if (!files.includes('package.json')) {
        throw new Error('INVALID_PROJECT');
      }

      // Read package.json
      const packageJson = await readPackageJson(dirHandle);
      
      // Detect project type and package manager
      const projectType = detectProjectType(packageJson, files);
      const packageManager = detectPackageManager(files);

      // Check if repository already exists
      const existingRepo = repositories.find(repo => 
        repo.name === dirName || repo.path === dirPath
      );

      if (existingRepo) {
        throw new Error('REPOSITORY_EXISTS');
      }

      // Create new repository object
      const newRepository: Repository = {
        id: Date.now().toString(),
        name: (packageJson?.name as string) || dirName,
        path: dirPath,
        type: projectType,
        packageManager,
        lastAccessed: new Date(),
        isActive: false,
        packageJson: packageJson as Repository['packageJson'] || {
          name: dirName,
          version: '1.0.0',
          scripts: {}
        }
      };

      return {
        repository: newRepository,
        isNewRepository: true
      };
    },
    onSuccess: (result) => {
      const { repository } = result;

      // Add to repositories
      setRepositories(prev => [repository, ...prev]);
      
      // Auto-select if requested
      if (autoSelect) {
        setSelectedRepository(repository);
      }
      
      toast({
        title: "專案已新增",
        description: `${repository.name} 已成功新增${autoSelect ? '並選擇' : '到專案列表'}。`,
      });

      // Call custom success handler
      onSuccess?.(repository);
    },
    onError: (error: Error) => {
      console.error('Error browsing folder:', error);
      
      if (error.name === 'AbortError') {
        // User cancelled the picker
        return;
      }

      switch (error.message) {
        case 'BROWSER_NOT_SUPPORTED':
          toast({
            title: "不支援的瀏覽器",
            description: "您的瀏覽器不支援 File System API。請使用 Chrome 86+ 或 Edge 86+。",
            variant: "destructive",
          });
          break;
        case 'INVALID_PROJECT':
          toast({
            title: "無效的專案資料夾",
            description: "選擇的資料夾不包含 package.json 檔案。",
            variant: "destructive",
          });
          break;
        case 'REPOSITORY_EXISTS':
          toast({
            title: "專案已存在",
            description: "此專案已經在列表中。",
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: "無法開啟資料夾",
            description: "讀取資料夾時發生錯誤。請確保您有適當的權限。",
            variant: "destructive",
          });
      }
    },
  });

  return {
    browseRepository: browseRepositoryMutation.mutate,
    isLoading: browseRepositoryMutation.isPending,
    error: browseRepositoryMutation.error,
    reset: browseRepositoryMutation.reset,
  };
} 