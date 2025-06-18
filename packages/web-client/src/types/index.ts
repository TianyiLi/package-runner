export interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  type?: string;
}

export interface ViteConfig {
  plugins?: any[];
  build?: any;
  server?: any;
  resolve?: any;
}

export interface NextConfig {
  reactStrictMode?: boolean;
  images?: any;
  experimental?: any;
}

export interface ScriptExecution {
  script: string;
  arguments: string;
  environment: Record<string, string>;
}