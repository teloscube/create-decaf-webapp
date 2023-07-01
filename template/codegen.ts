// Get the graphql schema from the Decaf API and generate the typescript types
import type { CodegenConfig } from '@graphql-codegen/cli';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const host = env.DECAF_WEBAPP_HOST;
const header = env.DECAF_AUTH_HEADER;

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
