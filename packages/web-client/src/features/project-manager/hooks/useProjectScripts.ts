import { useAtom } from 'jotai';
import { currentRepositoryScriptsAtom, selectedRepositoryAtom, scriptsAtom } from '@/store/atoms';

export function useProjectScripts() {
  const [currentScripts] = useAtom(currentRepositoryScriptsAtom);
  const [allScripts, setAllScripts] = useAtom(scriptsAtom);
  const [selectedRepo] = useAtom(selectedRepositoryAtom);

  const initializeScripts = () => {
    if (!selectedRepo?.packageJson?.scripts) return;

    const packageJsonScripts = selectedRepo.packageJson.scripts;
    const existingScripts = currentScripts.map(s => s.name);
    const newScripts = Object.entries(packageJsonScripts)
      .filter(([name]) => !existingScripts.includes(name))
      .map(([name, command]) => ({
        name,
        command: command as string,
        isRunning: false,
        repositoryId: selectedRepo.id
      }));

    if (newScripts.length > 0) {
      setAllScripts(prev => [...prev, ...newScripts]);
    }
  };

  const runScript = (scriptName: string) => {
    setAllScripts(prev => 
      prev.map(script => 
        script.name === scriptName && script.repositoryId === selectedRepo?.id
          ? { ...script, isRunning: true, lastRun: new Date() }
          : script
      )
    );
    
    // Simulate script execution
    setTimeout(() => {
      setAllScripts(prev => 
        prev.map(script => 
          script.name === scriptName && script.repositoryId === selectedRepo?.id
            ? { ...script, isRunning: false, output: ['Script completed successfully'] }
            : script
        )
      );
    }, 3000);
  };

  const stopScript = (scriptName: string) => {
    setAllScripts(prev => 
      prev.map(script => 
        script.name === scriptName && script.repositoryId === selectedRepo?.id
          ? { ...script, isRunning: false }
          : script
      )
    );
  };

  const getScriptTypeIcon = (scriptName: string) => {
    if (scriptName.includes('dev') || scriptName.includes('start')) return '🚀';
    if (scriptName.includes('build')) return '🔨';
    if (scriptName.includes('test')) return '🧪';
    if (scriptName.includes('lint')) return '🔍';
    return '⚙️';
  };

  const runningScripts = currentScripts.filter(script => script.isRunning);

  return {
    currentScripts,
    allScripts,
    selectedRepo,
    runningScripts,
    initializeScripts,
    runScript,
    stopScript,
    getScriptTypeIcon
  };
} 