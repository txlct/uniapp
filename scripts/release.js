const args = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const colors = require('picocolors')
const semver = require('semver')
const currentVersion = require('../package.json').version
const { prompt } = require('enquirer')
const execa = require('execa')
const { targets: packageTargets, fuzzyMatchTarget } = require('./utils')

const remoteRepoUrlPrefix = 'https://gitpkg.vercel.app/txlct/uniapp/packages/'
// 参数
const targetsArgs = args._ || [];
const targets = targetsArgs.length ? targetsArgs : packageTargets;
const isDryRun = args.dry
const skipTests = args.skipTests
const skipBuild = args.skipBuild
const onlyDist = args.onlyDist
const isLocal = args.local;
const isNeedTag = args.tag;
const packages = fs
  .readdirSync(path.resolve(__dirname, '../packages'))
  .filter(
    (p) => !p.endsWith('.ts') && !p.startsWith('.') && !p.includes('playground')
  )

const skippedPackages = []

const bin = (name) => path.resolve(__dirname, '../node_modules/.bin/' + name)
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
const getPkgRoot = (pkg) => path.resolve(__dirname, '../packages/' + pkg)
const step = (msg) => console.log(colors.cyan(msg))

const getCurrentBranch = async () => {
  const { stdout: branch } = await run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { stdio: 'pipe' })

  return branch?.trim() || '';
}

const targetMap = new Map();

const getPackageName = (name) => name.replace(/@dcloudio\//, '');

const setTargetMap = ({ tag, repo }) => {
  if (!tag && !repo) return;

  targets.forEach(target => {
    const name = getPackageName(target);
    const slash = repo.endsWith('/') ? '' : '/';

    const value = repo
      ? `${repo}${slash}${name}${tag ? `?${tag}` : ''}`
      : tag;

    targetMap.set(target, value)
  });
};  

async function main() {
  let isRemoteRepo = false;

  if (!isLocal) {
    ({ yes: isRemoteRepo } = (
      await prompt({
        type: 'confirm',
        name: 'yes',
        message: `是否远端分支?`
      })
    ))
  }

  let repo = '';

  if (isRemoteRepo) {
    ({ repo = '' } = (
      await prompt({
        type: 'input',
        name: 'repo',
        message: 'Input target repository',
        initial: remoteRepoUrlPrefix,
      })
    ));
  } 

  const { tag } = (
    await prompt({
      type: 'input',
      name: 'tag',
      message: isRemoteRepo
        ? '请输入远程分支名或tag名'
        : '请输入dependencies tag',
      initial: isRemoteRepo
        ? await getCurrentBranch()
        : isLocal ? 'workspace:*' : '' 
    })
  );

  let targetVersion = currentVersion;
  let tagname = '';

  if (isLocal || tag?.split('.')?.length < 3) {
    ({ version: targetVersion } = (
      await prompt({
        type: 'input',
        name: 'version',
        message: '输入自定义版本号',
        initial: currentVersion,
      })
    ))
    tagname = targetVersion;
  } else {
    targetVersion = `${currentVersion.slice(0, currentVersion.lastIndexOf('-'))}-${tag}`;
    tagname = tag;
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  setTargetMap({ tag, repo });

  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  })

  if (!yes) {
    return
  }

  // run tests before release
  step('\nRunning tests...')
  if (!skipTests && !isDryRun) {
    await run(bin('jest'), ['--clearCache'])
    await run('pnpm', ['test', '--', '--bail'])
  } else {
    console.log(`(skipped)`)
  }

  // update all package versions and inter-dependencies
  step('\nUpdating cross dependencies...')
  updateVersions(targetVersion)

  // build all packages with types
  step('\nBuilding all packages...')
  if (!skipBuild && !isDryRun) {
    let args = ['run', 'build']

    // 仅打包部分代码
    if (targets.length) {
      args = [
        ...args,
        '--',
        ...fuzzyMatchTarget(targets),
      ];
    }

    if (onlyDist) {
      const gitignore = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf-8')
      args = args.concat(targets.filter(target => gitignore.includes(`packages/${target}/dist`)))
    }

    await run('pnpm', args)
    // test generated dts files
    step('\nVerifying type declarations...')
    await run('pnpm', ['run', 'test-dts'])
  } else {
    console.log(`(skipped)`)
  }

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })

  if (stdout && !isLocal && isRemoteRepo && isNeedTag) {
    step('\nCommitting changes...')
    await run('git', ['add', '-A']);
    await run('git', ['commit', '-m', `release: ${tagname}`])
    step('\nGit tag...')
    await run('git', ['tag', `${tagname}`])
    // push to GitHub
    step('\nPushing tag to GitHub...')
    await run('git', ['push', 'origin', `${tagname}`])

    // update pnpm-lock.yaml
    step('\nUpdating lockfile...')
    await run(`pnpm`, ['install', '--prefer-offline'])

    step('\nCommitting pnpm-lock changes...')
    await run('git', ['add', '-A']);
    await run('git', ['commit', '-m', `release: ${tagname}`])
    step('\nPushing to GitHub...')
    await run('git', ['push', 'origin'])
  } else {
    console.log('No changes to commit.')
  }

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`)
  }

  if (skippedPackages.length) {
    console.log(
      colors.yellow(
        `The following packages are skipped and NOT published:\n- ${skippedPackages.join(
          '\n- '
        )}`
      )
    )
  }
}

function updateVersions(version) {
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version)
  // 2. update all packages
  packages.forEach((p) => updatePackage(getPkgRoot(p), version))
}

function updatePackage(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const name = getPackageName(pkg.name);

  if (![...targets, 'uni-app-next'].includes(name)) return;

  pkg.version = version
  updateDeps(pkg, 'dependencies', version)
  updateDeps(pkg, 'devDependencies', version)
  updateDeps(pkg, 'peerDependencies', version)
  updateDeps(pkg, 'optionalDependencies', version)
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

function updateDeps(pkg, depType, version) {
  const deps = pkg[depType]
  if (!deps) return
  Object.keys(deps).forEach((dep) => {
    const name = getPackageName(dep);

    if (
      dep.startsWith('@dcloudio')
      && packages.includes(name)
      && targets.includes(name)
    ) {
      console.log(
        colors.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`)
      )
      deps[dep] = targetMap.get(name) || version
    }
  })
}

main().catch((err) => {
  console.error(err)
})
