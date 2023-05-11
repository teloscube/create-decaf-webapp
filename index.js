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

const isNixInstalled = spawn.sync('which', ['nix-shell']).status === 0;
const isCaddyInstalled = spawn.sync('which', ['caddy']).status === 0;

const packager = 'npm';

function humanize(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

const FILES_TO_MODIFY = [
  '.env',
  '.env.example',
  '.github/workflows/deploy-preview.yml',
  '.github/workflows/production.yml',
  '.github/workflows/staging.yml',
  'Caddyfile',
  'package.json',
  'public/index.html',
  'public/manifest.json',
  'src/App.tsx',
  'shell.nix',
];

function printUsage() {
  console.log('Usage: create-decaf-webapp my-app "App Name"');
  console.log('       create-decaf-webapp --version');
  console.log('       create-decaf-webapp --help');
  console.log(chalk.dim('> App name is optional. If not provided, it will be humanized project name.'));
}

const runWithNpx = process.argv[0].endsWith('npx') || process.argv[0].endsWith('node');

const PROJECT_NAME_INDEX = runWithNpx ? 2 : 1;
const PROJECT_NAME_HUMAN_INDEX = runWithNpx ? 3 : 2;

const projectName = process.argv[PROJECT_NAME_INDEX];

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
} else if (fs.existsSync(projectName)) {
  console.error(chalk.yellow(`Directory ${chalk.bold(projectName)} already exists!`));
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

const projectNameHuman = process.argv[PROJECT_NAME_HUMAN_INDEX]?.trim() || humanize(projectName);

console.log(chalk.cyan(`Creating a new DECAF app in ${chalk.bold(projectName)}.`));

console.log(chalk.blue('We will be using "' + projectNameHuman + '" as the app name.'));

console.log(chalk.blueBright('Setting up the project files...'));

const username = spawn.sync('git', ['config', 'user.name'], { encoding: 'utf8' }).stdout.trim();
const usermail = spawn.sync('git', ['config', 'user.email'], { encoding: 'utf8' }).stdout.trim();

const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);
fs.mkdirSync(projectDir, { recursive: true });

const templateDir = path.resolve(__dirname, 'template');
fs.cpSync(templateDir, projectDir, { recursive: true });

fs.renameSync(path.join(projectDir, 'gitignore'), path.join(projectDir, '.gitignore'));

fs.renameSync(path.join(projectDir, 'env'), path.join(projectDir, '.env'));

const mFiles = FILES_TO_MODIFY.map((f) => path.resolve(currentDir, projectName, f));

replace.sync({
  files: mFiles,
  from: [/--projectname--/g, /--appname--/g, /--username--/g, /--usermail--/g],
  to: [projectName, projectNameHuman, username, usermail],
});

const projectPackageJson = require(path.join(projectDir, 'package.json'));

projectPackageJson.name = projectName;

const scripts = projectPackageJson.scripts;
scripts.caddy = isNixInstalled ? 'nix-shell --run "caddy run --envfile .env"' : 'caddy run --envfile .env';
projectPackageJson.scripts = scripts;

fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(projectPackageJson, null, 2));

spawn.sync('git', ['init'], { cwd: projectDir, stdio: 'inherit' });

console.log(chalk.blueBright('Installing dependencies. This might take a while.'));
spawn.sync(packager, ['install'], { cwd: projectDir, stdio: 'inherit' });

console.log(chalk.greenBright('☕ Success!'));
console.log(chalk.greenBright('Your new DECAF app is ready.'));
console.log(chalk.greenBright(`Created ${chalk.bold(projectName)} at ${projectDir}`));
console.log();
console.log(chalk.greenBright('cd ' + projectName));
console.log(chalk.greenBright(`${packager} start && ${packager} run caddy`));

if (!isNixInstalled && !isCaddyInstalled) {
  console.log('⚠️ ' + chalk.yellow('Warning!'));
  console.log(chalk.yellow('We could not find Nix or Caddy on your system.'));
  console.log(chalk.yellow('You will need Caddy server to run the app.'));
  console.log(chalk.yellow('If you install Nix, we will handle the rest for you.'));
  console.log(chalk.yellow('Or, you can install Caddy manually.'));
}
