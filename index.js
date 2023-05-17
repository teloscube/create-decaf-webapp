#!/usr/bin/env node

// Usage: npx create-decaf-webapp my-app

const chalk = require('chalk');
const spawn = require('cross-spawn');
const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
const validate = require('validate-npm-package-name');

const currentNodeVersion = process.versions.node;
const SUPPORTED_NODE_VERSION = 16;
const semver = currentNodeVersion.split('.');
const major = semver[0];

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

const packager = 'npm';

function humanize(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

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
  'shell.nix',
  'src/App.tsx',
];

function printUsage() {
  console.log('Usage: create-decaf-webapp my-app "App Name"');
  console.log('       create-decaf-webapp --version');
  console.log('       create-decaf-webapp --help');
  console.log(chalk.dim('> App name is optional. If not provided, it will be humanized project name.'));
  console.log(
    chalk.dim(
      '> Do not use "decaf-webapp-" prefix in the project name. It will be added automatically to the folder name.'
    )
  );
}

const runWithNpx = process.argv[0].endsWith('npx') || process.argv[0].endsWith('node');

const PROJECT_NAME_INDEX = runWithNpx ? 2 : 1;
const PROJECT_NAME_HUMAN_INDEX = runWithNpx ? 3 : 2;

const _projectName = process.argv[PROJECT_NAME_INDEX];
const projectName = _projectName?.startsWith('decaf-webapp-')
  ? _projectName.replace('decaf-webapp-', '')
  : _projectName;
const folderName = `decaf-webapp-${projectName}`;

switch (projectName) {
  case '-v':
  case '--version':
    console.log('v' + require('./package.json').version);
    process.exit(0);
  case '-h':
  case '--help':
    printUsage();
    process.exit(0);
}

if (!projectName) {
  console.error(chalk.yellow('Please specify the project name!'));
  printUsage();
  process.exit(1);
} else if (fs.existsSync(folderName)) {
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

const projectNameHuman = process.argv[PROJECT_NAME_HUMAN_INDEX]?.trim() || humanize(projectName);

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

replace.sync({
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

console.log();
console.log(chalk.greenBright('Success! 🎉'));
console.log();
console.log(chalk.greenBright('Your new DECAF app is ready.'));
console.log(chalk.green(`Created ${chalk.greenBright(projectNameHuman)} at ${chalk.gray(projectDir)}`));
console.log();
console.log(chalk.greenBright(`$ cd ${folderName} && ${packager} start`));
console.log();
console.log(chalk.dim(`Done in ${(Date.now() - _timer) / 1000} seconds.`));
