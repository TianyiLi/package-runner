import { useState } from 'react';
import { useAtom } from 'jotai';
import { Play, Square, Settings, Plus, Terminal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { currentRepositoryScriptsAtom, selectedRepositoryAtom, scriptsAtom } from '@/store/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ScriptsTab() {
  const [currentScripts] = useAtom(currentRepositoryScriptsAtom);
  const [allScripts, setAllScripts] = useAtom(scriptsAtom);
  const [selectedRepo] = useAtom(selectedRepositoryAtom);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [scriptArgs, setScriptArgs] = useState<string>('');
  const [packageManager, setPackageManager] = useState<string>('npm');

  if (!selectedRepo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No repository selected</p>
      </div>
    );
  }

  // Mock scripts from package.json
  const packageJsonScripts = selectedRepo.packageJson?.scripts || {};
  
  // Initialize scripts for this repository if not exists
  const initializeScripts = () => {
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

  // Initialize scripts on component mount
  if (currentScripts.length === 0 && Object.keys(packageJsonScripts).length > 0) {
    initializeScripts();
  }

  const handleRunScript = (scriptName: string) => {
    setAllScripts(prev => 
      prev.map(script => 
        script.name === scriptName && script.repositoryId === selectedRepo.id
          ? { ...script, isRunning: true, lastRun: new Date() }
          : script
      )
    );
    
    // Simulate script execution
    setTimeout(() => {
      setAllScripts(prev => 
        prev.map(script => 
          script.name === scriptName && script.repositoryId === selectedRepo.id
            ? { ...script, isRunning: false, output: ['Script completed successfully'] }
            : script
        )
      );
    }, 3000);
  };

  const handleStopScript = (scriptName: string) => {
    setAllScripts(prev => 
      prev.map(script => 
        script.name === scriptName && script.repositoryId === selectedRepo.id
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Scripts</h2>
          <p className="text-muted-foreground">
            Manage and execute scripts for <span className="font-medium">{selectedRepo.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Script
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Script</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="script-name">Script Name</Label>
                  <Input id="script-name" placeholder="e.g., test" />
                </div>
                <div>
                  <Label htmlFor="script-command">Command</Label>
                  <Textarea id="script-command" placeholder="e.g., npm test" />
                </div>
                <Button className="w-full">Add Script</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button>
            <Terminal className="mr-2 h-4 w-4" />
            Open Terminal
          </Button>
        </div>
      </div>

      {/* Running Scripts Alert */}
      {runningScripts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {runningScripts.length} script{runningScripts.length > 1 ? 's' : ''} running
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {runningScripts.map(script => (
                <Badge key={script.name} variant="outline" className="bg-background">
                  {script.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Available Scripts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Available Scripts
              </span>
              <Badge variant="secondary">{currentScripts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {currentScripts.map((script) => (
                  <div
                    key={script.name}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{getScriptTypeIcon(script.name)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{script.name}</h4>
                            <Badge variant={script.isRunning ? 'default' : 'secondary'}>
                              {script.isRunning ? 'Running' : 'Idle'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {script.command}
                          </p>
                        </div>
                      </div>
                      {script.lastRun && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Last run: {script.lastRun.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {script.isRunning ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStopScript(script.name)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRunScript(script.name)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {currentScripts.length === 0 && (
                  <div className="text-center py-8">
                    <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No scripts found in package.json</p>
                    <p className="text-sm text-muted-foreground">Add scripts to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Script Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Run Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="script-select">Select Script</Label>
              <Select value={selectedScript} onValueChange={setSelectedScript}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a script..." />
                </SelectTrigger>
                <SelectContent>
                  {currentScripts.map((script) => (
                    <SelectItem key={script.name} value={script.name}>
                      <div className="flex items-center gap-2">
                        <span>{getScriptTypeIcon(script.name)}</span>
                        <span>{script.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="package-manager">Package Manager</Label>
              <Select value={packageManager} onValueChange={setPackageManager}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="npm">npm</SelectItem>
                  <SelectItem value="yarn">yarn</SelectItem>
                  <SelectItem value="pnpm">pnpm</SelectItem>
                  <SelectItem value="bun">bun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="script-args">Additional Arguments</Label>
              <Input
                id="script-args"
                placeholder="e.g., --watch --port 3001"
                value={scriptArgs}
                onChange={(e) => setScriptArgs(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Command Preview</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {selectedScript ? (
                  `${packageManager} run ${selectedScript}${scriptArgs ? ` ${scriptArgs}` : ''}`
                ) : (
                  'Select a script to see command preview'
                )}
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={!selectedScript}
              onClick={() => selectedScript && handleRunScript(selectedScript)}
            >
              <Play className="mr-2 h-4 w-4" />
              Run Script
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}