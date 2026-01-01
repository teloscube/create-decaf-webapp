#!/usr/bin/env node

// Usage: npx create-decaf-webapp my-app

import chalk from 'chalk';
import { Command } from 'commander';
import spawn from 'cross-spawn';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { replaceInFileSync } from 'replace-in-file';
import validate from 'validate-npm-package-name';
const require = createRequire(import.meta.url);
const { version } = require('./package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function humanize(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

const currentNodeVersion = process.versions.node;
const SUPPORTED_NODE_VERSION = 16;
const semver = currentNodeVersion.split('.');
const major = parseInt(semver[0], 10);

if (major < SUPPORTED_NODE_VERSION) {
  console.error(
    'You are running Node ' +
    currentNodeVersion +
    '.\n' +
    `Create DECAF Webapp requires Node ${SUPPORTED_NODE_VERSION} or higher. \n` +
    'Please update your version of Node.'
  );
  process.exit(1);
}

const program = new Command();

program.option('-a, --app-name <app-name>', 'specify app name (default: derived from project code name)');
program.option('-t, --template <template>', 'specify template', 'typescript');
program.addHelpText('afterAll', '\nExample:\n  $ create-decaf-webapp app -a "My App"\n');
program
  .name('create-decaf-webapp')
  .arguments('<project-name>')
  .description('Create a new DECAF Webapp project.')
  .version(`v${version}`, '-v, --version');

program.allowExcessArguments(false);
program.allowUnknownOption(false);
program.showHelpAfterError(true);
program.showSuggestionAfterError(true);

program.parse(process.argv);

const options = program.opts();

const _projectName = program.args[0];
const projectName = _projectName?.startsWith('decaf-webapp-')
  ? _projectName.replace('decaf-webapp-', '')
  : _projectName;
const projectNameHuman = options['appName']?.trim() || humanize(projectName);
const folderName = `decaf-webapp-${projectName}`;
const packager = 'npm';

const FILES_TO_MODIFY = [
  '.env.example',
  '.env',
  '.github/workflows/deploy-preview.yml',
  '.github/workflows/deploy-production.yml',
  '.github/workflows/deploy-staging.yml',
  'index.html',
  'package.json',
  'public/manifest.json',
  'README.md',
  'flake.nix',
  'src/App.tsx',
];

if (fs.existsSync(folderName)) {
  console.error(chalk.yellow(`Directory ${chalk.bold(folderName)} already exists!`));
  process.exit(1);
} else if (validate(projectName).errors) {
  console.error(
    chalk.red(
      `Invalid project name: ${chalk.bold(chalk.white(projectName))}\n${validate(projectName).errors.join('\n')}`
    )
  );
  process.exit(1);
} else if (projectName.startsWith('-')) {
  console.error(chalk.red(`Invalid project name: ${chalk.bold(chalk.white(projectName))}`));
  console.error(chalk.red(`Project name cannot start with a -`));
  process.exit(1);
}

const _timer = Date.now();

console.log(chalk.cyan(`Creating a new DECAF app in ${chalk.bold(folderName)}.`));

console.log(chalk.blue('We will be using "' + projectNameHuman + '" as the app name.'));

console.log(chalk.blueBright('Setting up the project files...'));

const username = spawn.sync('git', ['config', 'user.name'], { encoding: 'utf8' }).stdout.trim();
const usermail = spawn.sync('git', ['config', 'user.email'], { encoding: 'utf8' }).stdout.trim();

const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, folderName);
fs.mkdirSync(projectDir, { recursive: true });

const templateDir = path.resolve(__dirname, 'template');
fs.cpSync(templateDir, projectDir, { recursive: true });

fs.renameSync(path.join(projectDir, 'gitignore'), path.join(projectDir, '.gitignore'));

fs.renameSync(path.join(projectDir, 'env'), path.join(projectDir, '.env'));
fs.cpSync(path.join(projectDir, '.env'), path.join(projectDir, '.env.example'));

const mFiles = FILES_TO_MODIFY.map((f) => path.resolve(currentDir, folderName, f));

replaceInFileSync({
  files: mFiles,
  from: [/--projectname--/g, /--appname--/g, /--username--/g, /--usermail--/g],
  to: [projectName, projectNameHuman, username, usermail],
});

const projectPackageJson = require(path.join(projectDir, 'package.json'));
projectPackageJson.name = folderName;
fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(projectPackageJson, null, 2));

spawn.sync('git', ['init'], { cwd: projectDir, stdio: 'inherit' });

console.log(chalk.blueBright('Installing dependencies. This might take a while.'));
spawn.sync(packager, ['install'], { cwd: projectDir, stdio: 'inherit' });

spawn.sync('npx', ['husky', 'init'], { cwd: projectDir, stdio: 'inherit' });
spawn.sync('echo "npx lint-staged" > .husky/pre-commit', { cwd: projectDir, stdio: 'inherit', shell: true });
spawn.sync('echo "npx commitlint --edit $1" > .husky/commit-msg', { cwd: projectDir, stdio: 'inherit', shell: true });

console.log();
console.log(chalk.greenBright('Success! 🎉'));
console.log();
console.log(chalk.greenBright('Your new DECAF app is ready.'));
console.log(chalk.green(`Created ${chalk.greenBright(projectNameHuman)} at ${chalk.gray(projectDir)}`));
console.log();
console.log(chalk.greenBright(`$ cd ${folderName} && ${packager} run dev`));
console.log();
console.log(chalk.dim(`Done in ${(Date.now() - _timer) / 1000} seconds.`));
