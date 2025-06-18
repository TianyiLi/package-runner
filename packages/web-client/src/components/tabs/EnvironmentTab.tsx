import { useState } from 'react';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { envVariablesAtom } from '@/store/atoms';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const envSchema = z.object({
  key: z.string().min(1, 'Key is required').regex(/^[A-Z_][A-Z0-9_]*$/, 'Invalid environment variable name'),
  value: z.string().min(1, 'Value is required'),
  isSecret: z.boolean().default(false),
});

type EnvFormData = z.infer<typeof envSchema>;

export function EnvironmentTab() {
  const [envVariables, setEnvVariables] = useAtom(envVariablesAtom);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<EnvFormData>({
    resolver: zodResolver(envSchema),
    defaultValues: {
      key: '',
      value: '',
      isSecret: false,
    },
  });

  // Mock initial data
  if (envVariables.length === 0) {
    setEnvVariables([
      { key: 'NODE_ENV', value: 'development', isSecret: false },
      { key: 'API_URL', value: 'https://api.example.com', isSecret: false },
      { key: 'DATABASE_URL', value: 'postgresql://user:pass@localhost:5432/db', isSecret: true },
      { key: 'JWT_SECRET', value: 'super-secret-key', isSecret: true },
    ]);
  }

  const onSubmit = (data: EnvFormData) => {
    if (editingIndex !== null) {
      // Update existing variable
      setEnvVariables(prev => 
        prev.map((env, index) => 
          index === editingIndex ? data : env
        )
      );
      setEditingIndex(null);
      toast.success('Environment variable updated');
    } else {
      // Add new variable
      setEnvVariables(prev => [...prev, data]);
      toast.success('Environment variable added');
    }
    form.reset();
  };

  const handleEdit = (index: number) => {
    const env = envVariables[index];
    form.setValue('key', env.key);
    form.setValue('value', env.value);
    form.setValue('isSecret', env.isSecret);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setEnvVariables(prev => prev.filter((_, i) => i !== index));
    toast.success('Environment variable deleted');
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateEnvFile = () => {
    const envContent = envVariables
      .map(env => `${env.key}=${env.value}`)
      .join('\n');
    
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('.env file downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Environment Variables</h2>
        <Button onClick={generateEnvFile} variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Download .env
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingIndex !== null ? 'Edit Variable' : 'Add New Variable'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variable Name</FormLabel>
                      <FormControl>
                        <Input placeholder="API_KEY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="your-api-key-here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isSecret"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Mark as Secret</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    {editingIndex !== null ? 'Update' : 'Add'} Variable
                  </Button>
                  {editingIndex !== null && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingIndex(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Variables ({envVariables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {envVariables.map((env, index) => (
                  <div
                    key={`${env.key}-${index}`}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{env.key}</Label>
                        {env.isSecret && (
                          <Badge variant="secondary" className="text-xs">
                            Secret
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {env.isSecret && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSecretVisibility(env.key)}
                          >
                            {showSecrets[env.key] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground break-all">
                      {env.isSecret && !showSecrets[env.key]
                        ? '••••••••••••••••'
                        : env.value}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4">
            <pre className="text-sm">
              {envVariables
                .map(env => `${env.key}=${env.isSecret ? '***' : env.value}`)
                .join('\n')}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}