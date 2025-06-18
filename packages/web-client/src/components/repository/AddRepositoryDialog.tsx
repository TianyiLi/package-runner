import { useState } from 'react';
import { useAtom } from 'jotai';
import { Plus, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { repositoriesAtom, Repository } from '@/store/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBrowseRepository } from '@/hooks/useBrowseRepository';
import { PROJECT_TYPES, PACKAGE_MANAGERS, ProjectType, PackageManager } from '@/constants/project';

interface ProjectData {
  name: string;
  path: string;
  type: ProjectType;
  packageManager: PackageManager;
  packageJson: Repository['packageJson'];
}

interface FormData {
  name: string;
  path: string;
  type: ProjectType | '';
  packageManager: PackageManager | '';
}

interface AddRepositoryDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (repository: Repository) => void;
}

export function AddRepositoryDialog({ trigger, onSuccess }: AddRepositoryDialogProps) {
  const [, setRepositories] = useAtom(repositoriesAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    path: '',
    type: '',
    packageManager: ''
  });

  const { browseRepository } = useBrowseRepository({
    onSuccess: (repository) => {
      // Set the detected project data for form
      setProjectData({
        name: repository.name,
        path: repository.path,
        type: repository.type,
        packageManager: repository.packageManager,
        packageJson: repository.packageJson
      });
      
      // Pre-fill form with detected data
      setFormData({
        name: repository.name,
        path: repository.path,
        type: repository.type,
        packageManager: repository.packageManager
      });
    }
  });

  const handleBrowseFolder = () => {
    browseRepository();
  };

  const handleAddRepository = () => {
    if (!projectData) return;

    // Create repository from form data
    const newRepository: Repository = {
      id: Date.now().toString(),
      name: formData.name,
      path: formData.path,
      type: formData.type || projectData.type,
      packageManager: formData.packageManager || projectData.packageManager,
      lastAccessed: new Date(),
      isActive: false,
      packageJson: projectData.packageJson
    };

    setRepositories(prev => [newRepository, ...prev]);
    setIsOpen(false);
    
    // Reset form
    resetForm();
    
    // Call success callback
    onSuccess?.(newRepository);
  };

  const resetForm = () => {
    setProjectData(null);
    setFormData({
      name: '',
      path: '',
      type: '',
      packageManager: ''
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Repository
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Repository</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="repo-name">Repository Name</Label>
            <Input 
              id="repo-name" 
              placeholder="my-awesome-project"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="repo-path">Path</Label>
            <Input 
              id="repo-path" 
              placeholder="Click to browse folder..." 
              value={formData.path}
              readOnly
              className="cursor-pointer"
              onClick={handleBrowseFolder}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Click the path field to browse and auto-detect project settings
            </p>
          </div>
          <div>
            <Label htmlFor="project-type">Project Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ProjectType }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={projectData ? `Detected: ${projectData.type}` : "Browse folder to auto-detect"} />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="package-manager">Package Manager</Label>
            <Select 
              value={formData.packageManager} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, packageManager: value as PackageManager }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={projectData ? `Detected: ${projectData.packageManager}` : "Browse folder to auto-detect"} />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_MANAGERS.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full" 
            onClick={handleAddRepository}
            disabled={!projectData || !formData.name}
          >
            Add Repository
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 