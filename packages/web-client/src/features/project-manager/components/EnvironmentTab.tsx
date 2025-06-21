import { useState } from 'react';
import { useAtom } from 'jotai';
import { Plus, Copy, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { envVariablesAtom, selectedRepositoryAtom } from '@/store/atoms';
import type { ProjectEnvironment } from '../types';

export function EnvironmentTab() {
  const [envVars, setEnvVars] = useAtom(envVariablesAtom);
  const [selectedRepo] = useAtom(selectedRepositoryAtom);
  const [showSecrets, setShowSecrets] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newEnvIsSecret, setNewEnvIsSecret] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!selectedRepo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">未選擇倉庫</p>
      </div>
    );
  }

  const currentEnvVars = envVars.filter(env => env.repositoryId === selectedRepo.id);
  const filteredEnvVars = currentEnvVars.filter(env => 
    env.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    env.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEnvVar = () => {
    if (!newEnvKey.trim() || !newEnvValue.trim()) return;

    const newEnv: ProjectEnvironment & { repositoryId: string } = {
      key: newEnvKey,
      value: newEnvValue,
      isSecret: newEnvIsSecret,
      repositoryId: selectedRepo.id
    };

    setEnvVars(prev => [...prev, newEnv]);
    
    // Reset form
    setNewEnvKey('');
    setNewEnvValue('');
    setNewEnvIsSecret(false);
  };

  const handleDeleteEnvVar = (key: string) => {
    setEnvVars(prev => prev.filter(env => 
      !(env.key === key && env.repositoryId === selectedRepo.id)
    ));
  };

  const handleCopyValue = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const handleExportEnv = () => {
    const envContent = currentEnvVars
      .map(env => `${env.key}=${env.value}`)
      .join('\n');
    
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
  };

  const secretCount = currentEnvVars.filter(env => env.isSecret).length;
  const publicCount = currentEnvVars.filter(env => !env.isSecret).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">環境變數</h2>
          <p className="text-muted-foreground">
            管理 <span className="font-medium">{selectedRepo.name}</span> 的環境變數
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportEnv}>
            <Download className="mr-2 h-4 w-4" />
            匯出 .env
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增變數
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增環境變數</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="env-key">變數名稱</Label>
                  <Input 
                    id="env-key" 
                    placeholder="例如：API_URL"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="env-value">變數值</Label>
                  <Input 
                    id="env-value" 
                    placeholder="例如：https://api.example.com"
                    value={newEnvValue}
                    onChange={(e) => setNewEnvValue(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="env-secret" 
                    checked={newEnvIsSecret}
                    onCheckedChange={setNewEnvIsSecret}
                  />
                  <Label htmlFor="env-secret">標記為機密</Label>
                </div>
                <Button className="w-full" onClick={handleAddEnvVar}>
                  新增變數
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{currentEnvVars.length}</div>
            <p className="text-xs text-muted-foreground">總環境變數</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{publicCount}</div>
            <p className="text-xs text-muted-foreground">公開變數</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{secretCount}</div>
            <p className="text-xs text-muted-foreground">機密變數</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="搜尋環境變數..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-secrets" 
                checked={showSecrets}
                onCheckedChange={setShowSecrets}
              />
              <Label htmlFor="show-secrets">顯示機密值</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Variables List */}
      <Card>
        <CardHeader>
          <CardTitle>環境變數清單</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredEnvVars.map((env) => (
                <div
                  key={env.key}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="font-mono text-sm font-medium">{env.key}</code>
                      {env.isSecret && (
                        <Badge variant="destructive" className="text-xs">
                          機密
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm text-muted-foreground truncate">
                        {env.isSecret && !showSecrets 
                          ? '•••••••••••••••' 
                          : env.value
                        }
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyValue(env.value)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEnvVar(env.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 