// Get the graphql schema from the Decaf API and generate the typescript types
import type { CodegenConfig } from '@graphql-codegen/cli';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const host = env.DECAF_WEBAPP_HOST;
const header = env.DECAF_AUTH_HEADER;

// First, run `npm run zeus` to generate the zeus files (see package.json)
execSync('npm run zeus', {
  stdio: 'inherit',
  env: env,
});

// replace all `export const enum` with `export enum` in the generated zeus files
const dir = path.resolve(__dirname, './src/autogen/zeus');
const files = fs.readdirSync(dir);

files.forEach((file) => {
  const filePath = path.resolve(dir, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const newFileContent = fileContent.replace(/export const enum/g, 'export enum');
  fs.writeFileSync(filePath, newFileContent, 'utf-8');
});

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [`https://${host}/apis/microlot/v1/graphql`]: {
      headers: {
        Authorization: header,
      },
    },
  },
  generates: {
    './src/autogen/microlot.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
