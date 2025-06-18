import { EnvVariable, CreateEnvVariable, UpdateEnvVariable } from '../schemas';

class EnvService {
  private envVariables: EnvVariable[] = [];

  async getAllEnvVariables(repositoryId?: string): Promise<EnvVariable[]> {
    if (repositoryId) {
      return this.envVariables.filter(env => env.repositoryId === repositoryId);
    }
    return [...this.envVariables];
  }

  async getEnvVariableById(id: string): Promise<EnvVariable | null> {
    return this.envVariables.find(env => env.id === id) || null;
  }

  async createEnvVariable(data: CreateEnvVariable): Promise<EnvVariable> {
    // Check if key already exists for this repository
    const existingEnv = this.envVariables.find(
      env => env.key === data.key && env.repositoryId === data.repositoryId
    );

    if (existingEnv) {
      throw new Error(`Environment variable '${data.key}' already exists for this repository`);
    }

    const envVariable: EnvVariable = {
      id: Date.now().toString(),
      ...data,
    };

    this.envVariables.push(envVariable);
    return envVariable;
  }

  async updateEnvVariable(id: string, data: UpdateEnvVariable): Promise<EnvVariable | null> {
    const index = this.envVariables.findIndex(env => env.id === id);
    if (index === -1) return null;

    const currentEnv = this.envVariables[index];

    // Check if key update would conflict with existing variable
    if (data.key && data.key !== currentEnv.key) {
      const existingEnv = this.envVariables.find(
        env => env.key === data.key && env.repositoryId === currentEnv.repositoryId && env.id !== id
      );

      if (existingEnv) {
        throw new Error(`Environment variable '${data.key}' already exists for this repository`);
      }
    }

    const updatedEnvVariable: EnvVariable = {
      ...currentEnv,
      ...data,
    };

    this.envVariables[index] = updatedEnvVariable;
    return updatedEnvVariable;
  }

  async deleteEnvVariable(id: string): Promise<boolean> {
    const index = this.envVariables.findIndex(env => env.id === id);
    if (index === -1) return false;

    this.envVariables.splice(index, 1);
    return true;
  }

  async generateEnvFile(repositoryId: string): Promise<string> {
    const envVars = await this.getAllEnvVariables(repositoryId);
    
    const envContent = envVars
      .map(env => `${env.key}=${env.value}`)
      .join('\n');

    return envContent;
  }

  async importEnvFile(repositoryId: string, envContent: string): Promise<EnvVariable[]> {
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const importedVars: EnvVariable[] = [];

    for (const line of lines) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('='); // Handle values with = in them

      if (key && value !== undefined) {
        try {
          const envVar = await this.createEnvVariable({
            key: key.trim(),
            value: value.trim(),
            isSecret: false,
            repositoryId,
          });
          importedVars.push(envVar);
        } catch (error) {
          // Skip if variable already exists
          console.warn(`Skipping duplicate environment variable: ${key}`);
        }
      }
    }

    return importedVars;
  }

  async getEnvVariablesByKeys(repositoryId: string, keys: string[]): Promise<Record<string, string>> {
    const envVars = await this.getAllEnvVariables(repositoryId);
    const result: Record<string, string> = {};

    for (const env of envVars) {
      if (keys.includes(env.key)) {
        result[env.key] = env.value;
      }
    }

    return result;
  }

  async initializeWithMockData(repositoryId: string): Promise<void> {
    const existingEnvs = this.envVariables.filter(e => e.repositoryId === repositoryId);
    
    if (existingEnvs.length === 0) {
      const mockEnvs = [
        {
          key: 'NODE_ENV',
          value: 'development',
          isSecret: false,
          repositoryId,
        },
        {
          key: 'API_URL',
          value: 'https://api.example.com',
          isSecret: false,
          repositoryId,
        },
        {
          key: 'DATABASE_URL',
          value: 'postgresql://user:pass@localhost:5432/db',
          isSecret: true,
          repositoryId,
        },
        {
          key: 'JWT_SECRET',
          value: 'super-secret-key',
          isSecret: true,
          repositoryId,
        },
      ];

      for (const envData of mockEnvs) {
        await this.createEnvVariable(envData);
      }
    }
  }

  // Utility method to mask secret values in responses
  maskSecrets(envVariables: EnvVariable[]): EnvVariable[] {
    return envVariables.map(env => ({
      ...env,
      value: env.isSecret ? '*'.repeat(8) : env.value,
    }));
  }

  // Get actual values (for internal use)
  async getActualValues(repositoryId: string): Promise<Record<string, string>> {
    const envVars = await this.getAllEnvVariables(repositoryId);
    const result: Record<string, string> = {};

    for (const env of envVars) {
      result[env.key] = env.value;
    }

    return result;
  }
}

export const envService = new EnvService(); 