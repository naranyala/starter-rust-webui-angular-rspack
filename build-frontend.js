#!/usr/bin/env bun

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';

const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');
const QUIET = process.argv.includes('--quiet') || process.argv.includes('-q');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

class BuildLogger {
  constructor() {
    this.steps = [];
    this.currentStep = null;
    this.startTime = Date.now();
    this.warnings = [];
    this.errors = [];
  }

  get timestamp() {
    return new Date().toISOString();
  }

  log(level, message, meta = {}) {
    const entry = { timestamp: this.timestamp, level, message, meta };
    
    if (!QUIET) {
      const color = this.getLevelColor(level);
      const prefix = this.getLevelPrefix(level);
      console.log(`${color}${prefix}${colors.reset} ${message}`);
    }
  }

  getLevelColor(level) {
    const colorsByLevel = {
      DEBUG: colors.gray,
      INFO: colors.blue,
      WARN: colors.yellow,
      ERROR: colors.red,
      SUCCESS: colors.green,
      STEP: colors.cyan
    };
    return colorsByLevel[level] || colors.white;
  }

  getLevelPrefix(level) {
    const prefixes = {
      DEBUG: '[DEBUG]',
      INFO: '[INFO]',
      WARN: '[WARN]',
      ERROR: '[ERROR]',
      SUCCESS: '[✓]',
      STEP: '[STEP]'
    };
    return prefixes[level] || '[LOG]';
  }

  debug(message) { this.log('DEBUG', message); }
  info(message) { this.log('INFO', message); }
  warn(message) { this.log('WARN', message); }
  error(message) { this.log('ERROR', message); }
  success(message) { this.log('SUCCESS', message); }

  startStep(name, description = '') {
    const step = { name, description, startTime: Date.now(), status: 'running' };
    this.currentStep = step;
    this.steps.push(step);
    this.log('STEP', `Starting: ${name}${description ? ` - ${description}` : ''}`);
    return step;
  }

  stepLog(message, level = 'INFO') {
    if (this.currentStep) {
      if (level === 'WARN') this.warnings.push({ step: this.currentStep.name, message });
      if (level === 'ERROR') this.errors.push({ step: this.currentStep.name, message });
      this.log(level, `  ${message}`);
    }
  }

  endStep(success = true, error = null) {
    if (this.currentStep) {
      const duration = Date.now() - this.currentStep.startTime;
      this.currentStep.duration = duration;
      this.currentStep.status = success ? 'success' : 'failed';
      
      const statusText = success ? 'completed' : 'failed';
      if (success) {
        this.log('SUCCESS', `Finished: ${this.currentStep.name} (${duration}ms)`);
      } else {
        this.log('ERROR', `Failed: ${this.currentStep.name} - ${error?.message || 'Unknown error'}`);
      }
      this.currentStep = null;
    }
  }

  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const successfulSteps = this.steps.filter(s => s.status === 'success').length;
    const failedSteps = this.steps.filter(s => s.status === 'failed').length;

    console.log('\n' + colors.bright + '='.repeat(60) + colors.reset);
    console.log(colors.bright + 'BUILD SUMMARY' + colors.reset);
    console.log(colors.bright + '='.repeat(60) + colors.reset);
    console.log(`  Total Duration: ${totalDuration}ms`);
    console.log(`  Steps: ${successfulSteps} successful, ${failedSteps} failed, ${this.steps.length} total`);
    console.log(colors.bright + '='.repeat(60) + colors.reset + '\n');

    return { success: failedSteps === 0, totalDuration, steps: this.steps };
  }
}

const logger = new BuildLogger();

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function buildFrontend() {
  logger.info('Starting frontend build');

  const originalDir = process.cwd();
  const projectRoot = path.resolve(__dirname);
  const frontendDir = path.join(projectRoot, 'frontend');
  const distPath = path.join(frontendDir, 'dist');

  // Ensure project root directories exist (not symlinks)
  const rootDist = path.join(projectRoot, 'dist');
  const rootStatic = path.join(projectRoot, 'static');
  const rootStaticJs = path.join(rootStatic, 'js');
  const rootStaticCss = path.join(rootStatic, 'css');

  try {
    // Check if rootDist or rootStatic are symlinks and remove them
    for (const dir of [rootDist, rootStatic]) {
      try {
        const stat = await fs.lstat(dir);
        if (stat.isSymbolicLink()) {
          await fs.unlink(dir);
          logger.debug(`Removed symlink: ${dir}`);
        }
      } catch {
        // Directory doesn't exist, will create it
      }
    }

    process.chdir(frontendDir);

    // Step 1: Install dependencies
    logger.startStep('dependencies', 'Installing frontend dependencies');
    try {
      await fs.access('node_modules');
      logger.stepLog('Dependencies already installed');
    } catch {
      logger.stepLog('Installing dependencies with bun...');
      execSync('bun install', { stdio: VERBOSE ? 'inherit' : 'pipe' });
      logger.stepLog('Dependencies installed');
    }
    logger.endStep(true);

    // Step 2: Build with Rspack
    logger.startStep('rspack-build', 'Running Rspack build');
    try {
      const buildStart = Date.now();
      execSync('bun run build:rspack', { stdio: VERBOSE ? 'inherit' : 'pipe', cwd: frontendDir });
      const buildDuration = Date.now() - buildStart;
      logger.stepLog(`Rspack build completed in ${buildDuration}ms`);
    } catch (buildError) {
      logger.stepLog(`Build failed: ${buildError.message}`, 'ERROR');
      logger.endStep(false, buildError);
      throw buildError;
    }
    logger.endStep(true);

    // Step 3: Copy Rspack build output to project root dist/
    logger.startStep('copy-assets', 'Copying built assets');

    // Rspack outputs to frontend/dist/browser/
    const rspackOutputDir = path.join(frontendDir, 'dist', 'browser');
    
    if (!(await pathExists(rspackOutputDir))) {
      throw new Error(`Rspack output directory not found: ${rspackOutputDir}`);
    }

    // Remove existing dist if it exists
    try {
      await fs.rm(rootDist, { recursive: true, force: true });
    } catch {}

    // Copy entire browser folder contents to root dist
    await fs.cp(rspackOutputDir, rootDist, { recursive: true });
    logger.stepLog(`Copied Rspack output to ${rootDist}`);

    // Also copy to static folders for compatibility
    await fs.mkdir(rootStaticJs, { recursive: true });
    await fs.mkdir(rootStaticCss, { recursive: true });
    
    // Copy JS files to static/js
    const jsFiles = (await fs.readdir(rootDist)).filter(f => f.endsWith('.js'));
    for (const jsFile of jsFiles) {
      const src = path.join(rootDist, jsFile);
      const dest = path.join(rootStaticJs, jsFile);
      await fs.copyFile(src, dest);
    }
    logger.stepLog(`Copied ${jsFiles.length} JS files to static/js`);
    
    // Copy CSS files to static/css
    try {
      const cssFiles = (await fs.readdir(path.join(rootDist, 'styles'))).filter(f => f.endsWith('.css'));
      await fs.mkdir(path.join(rootStaticCss, 'styles'), { recursive: true });
      for (const cssFile of cssFiles) {
        const src = path.join(rootDist, 'styles', cssFile);
        const dest = path.join(rootStaticCss, 'styles', cssFile);
        await fs.copyFile(src, dest);
      }
      logger.stepLog(`Copied ${cssFiles.length} CSS files to static/css`);
    } catch {
      logger.stepLog('No separate CSS files found (likely bundled)', 'INFO');
    }

    logger.endStep(true);

    logger.success('Frontend build completed!');
    logger.printSummary();

  } catch (error) {
    logger.error(`Build failed: ${error.message}`);
    logger.printSummary();
    process.exitCode = 1;
  } finally {
    process.chdir(originalDir);
  }
}

buildFrontend();
