import { Script, CreateScript, ExecuteScript } from '../schemas';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

class ScriptService extends EventEmitter {
  private scripts: Script[] = [];
  private runningProcesses: Map<string, ChildProcess> = new Map();

  async getAllScripts(repositoryId?: string): Promise<Script[]> {
    if (repositoryId) {
      return this.scripts.filter(script => script.repositoryId === repositoryId);
    }
    return [...this.scripts];
  }

  async getScriptById(id: string): Promise<Script | null> {
    return this.scripts.find(script => script.id === id) || null;
  }

  async createScript(data: CreateScript): Promise<Script> {
    const script: Script = {
      id: Date.now().toString(),
      ...data,
      isRunning: false,
    };

    this.scripts.push(script);
    return script;
  }

  async updateScript(id: string, data: Partial<CreateScript>): Promise<Script | null> {
    const index = this.scripts.findIndex(script => script.id === id);
    if (index === -1) return null;

    const updatedScript: Script = {
      ...this.scripts[index],
      ...data,
    };

    this.scripts[index] = updatedScript;
    return updatedScript;
  }

  async deleteScript(id: string): Promise<boolean> {
    const index = this.scripts.findIndex(script => script.id === id);
    if (index === -1) return false;

    // Stop script if running
    if (this.scripts[index].isRunning) {
      await this.stopScript(id);
    }

    this.scripts.splice(index, 1);
    return true;
  }

  async executeScript(data: ExecuteScript): Promise<Script> {
    const script = await this.getScriptById(data.scriptId);
    if (!script) {
      throw new Error('Script not found');
    }

    if (script.isRunning) {
      throw new Error('Script is already running');
    }

    // Mark script as running
    script.isRunning = true;
    script.lastRun = new Date();
    script.output = [];

    // Build command with arguments
    let command = script.command;
    if (data.arguments) {
      command += ` ${data.arguments}`;
    }

    // Parse command and arguments
    const [cmd, ...args] = command.split(' ');

    // Set up environment variables
    const env = {
      ...process.env,
      ...data.environment,
    };

    try {
      // Start the process
      const childProcess = spawn(cmd, args, {
        cwd: script.repositoryId ? await this.getRepositoryPath(script.repositoryId) : process.cwd(),
        env,
        shell: true,
      });

      // Store process reference
      this.runningProcesses.set(script.id, childProcess);
      script.pid = childProcess.pid;

      // Handle stdout
      childProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        script.output = script.output || [];
        script.output.push(output);
        
        // Emit real-time output
        this.emit('scriptOutput', {
          scriptId: script.id,
          output,
          type: 'stdout',
        });
      });

      // Handle stderr
      childProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        script.output = script.output || [];
        script.output.push(`ERROR: ${output}`);
        
        // Emit real-time output
        this.emit('scriptOutput', {
          scriptId: script.id,
          output,
          type: 'stderr',
        });
      });

      // Handle process exit
      childProcess.on('close', (code) => {
        script.isRunning = false;
        script.pid = undefined;
        this.runningProcesses.delete(script.id);
        
        const exitMessage = `Process exited with code ${code}`;
        script.output = script.output || [];
        script.output.push(exitMessage);

        // Emit script completion
        this.emit('scriptCompleted', {
          scriptId: script.id,
          exitCode: code,
          output: script.output,
        });
      });

      // Handle process error
      childProcess.on('error', (error) => {
        script.isRunning = false;
        script.pid = undefined;
        this.runningProcesses.delete(script.id);
        
        const errorMessage = `Process error: ${error.message}`;
        script.output = script.output || [];
        script.output.push(errorMessage);

        // Emit script error
        this.emit('scriptError', {
          scriptId: script.id,
          error: error.message,
          output: script.output,
        });
      });

    } catch (error) {
      script.isRunning = false;
      script.pid = undefined;
      throw error;
    }

    return script;
  }

  async stopScript(scriptId: string): Promise<boolean> {
    const script = await this.getScriptById(scriptId);
    if (!script || !script.isRunning) {
      return false;
    }

    const childProcess = this.runningProcesses.get(scriptId);
    if (childProcess && !childProcess.killed) {
      childProcess.kill('SIGTERM');
      
      // Force kill after 5 seconds if not terminated
      setTimeout(() => {
        if (!childProcess.killed) {
          childProcess.kill('SIGKILL');
        }
      }, 5000);

      return true;
    }

    return false;
  }

  async getRunningScripts(): Promise<Script[]> {
    return this.scripts.filter(script => script.isRunning);
  }

  async getScriptOutput(scriptId: string): Promise<string[]> {
    const script = await this.getScriptById(scriptId);
    return script?.output || [];
  }

  private async getRepositoryPath(repositoryId: string): Promise<string> {
    // This would normally get the repository path from the repository service
    // For now, return current directory
    return process.cwd();
  }

  async initializeWithMockData(repositoryId: string): Promise<void> {
    const existingScripts = this.scripts.filter(s => s.repositoryId === repositoryId);
    
    if (existingScripts.length === 0) {
      const mockScripts = [
        {
          name: 'dev',
          command: 'npm run dev',
          repositoryId,
        },
        {
          name: 'build',
          command: 'npm run build',
          repositoryId,
        },
        {
          name: 'test',
          command: 'npm test',
          repositoryId,
        },
        {
          name: 'lint',
          command: 'npm run lint',
          repositoryId,
        },
      ];

      for (const scriptData of mockScripts) {
        await this.createScript(scriptData);
      }
    }
  }

  // Clean up on shutdown
  async cleanup(): Promise<void> {
    for (const [scriptId, process] of this.runningProcesses) {
      if (!process.killed) {
        process.kill('SIGTERM');
      }
    }
    this.runningProcesses.clear();
  }
}

export const scriptService = new ScriptService(); 