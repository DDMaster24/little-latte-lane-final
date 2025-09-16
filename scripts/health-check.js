#!/usr/bin/env node

/**
 * Health Check Script
 * Validates system integrity and configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#') && key.trim()) {
      process.env[key.trim()] = valueParts.join('=');
    }
  });
}

console.log('🏥 Little Latte Lane - System Health Check');
console.log('==========================================');

const checks = [];

// 1. Environment Variables Check
console.log('\n📋 Checking Environment Variables...');
try {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '));
    checks.push({ name: 'Environment Variables', status: 'FAIL', details: `Missing: ${missing.join(', ')}` });
  } else {
    console.log('✅ All required environment variables present');
    checks.push({ name: 'Environment Variables', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ Environment check failed:', error.message);
  checks.push({ name: 'Environment Variables', status: 'ERROR', details: error.message });
}

// 2. TypeScript Check
console.log('\n🔧 Checking TypeScript...');
try {
  execSync('npm run typecheck', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
  checks.push({ name: 'TypeScript', status: 'PASS' });
} catch (error) {
  console.log('❌ TypeScript errors found');
  checks.push({ name: 'TypeScript', status: 'FAIL', details: 'Compilation errors' });
}

// 3. ESLint Check
console.log('\n📝 Checking ESLint...');
try {
  execSync('npm run lint', { stdio: 'pipe' });
  console.log('✅ ESLint passed');
  checks.push({ name: 'ESLint', status: 'PASS' });
} catch (error) {
  console.log('❌ ESLint errors found');
  checks.push({ name: 'ESLint', status: 'FAIL', details: 'Linting errors' });
}

// 4. File Structure Check
console.log('\n📁 Checking File Structure...');
try {
  const criticalPaths = [
    'src/app',
    'src/components',
    'src/lib',
    'src/types',
    'package.json',
    'next.config.ts',
    'tsconfig.json'
  ];
  
  const missingPaths = criticalPaths.filter(pathToCheck => 
    !fs.existsSync(path.join(process.cwd(), pathToCheck))
  );
  
  if (missingPaths.length > 0) {
    console.log('❌ Missing critical paths:', missingPaths.join(', '));
    checks.push({ name: 'File Structure', status: 'FAIL', details: `Missing: ${missingPaths.join(', ')}` });
  } else {
    console.log('✅ All critical paths exist');
    checks.push({ name: 'File Structure', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ File structure check failed:', error.message);
  checks.push({ name: 'File Structure', status: 'ERROR', details: error.message });
}

// 5. Dependencies Check
console.log('\n📦 Checking Dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const nodeModulesExists = fs.existsSync('node_modules');
  const lockFileExists = fs.existsSync('package-lock.json');
  
  if (!nodeModulesExists) {
    console.log('❌ node_modules directory missing - run npm install');
    checks.push({ name: 'Dependencies', status: 'FAIL', details: 'node_modules missing' });
  } else if (!lockFileExists) {
    console.log('⚠️ package-lock.json missing - dependencies may be inconsistent');
    checks.push({ name: 'Dependencies', status: 'WARN', details: 'No lockfile' });
  } else {
    console.log('✅ Dependencies properly installed');
    checks.push({ name: 'Dependencies', status: 'PASS' });
  }
} catch (error) {
  console.log('❌ Dependencies check failed:', error.message);
  checks.push({ name: 'Dependencies', status: 'ERROR', details: error.message });
}

// Summary Report
console.log('\n🎯 Health Check Summary');
console.log('======================');

const passed = checks.filter(check => check.status === 'PASS').length;
const failed = checks.filter(check => check.status === 'FAIL').length;
const errors = checks.filter(check => check.status === 'ERROR').length;
const warnings = checks.filter(check => check.status === 'WARN').length;

checks.forEach(check => {
  const icon = {
    'PASS': '✅',
    'FAIL': '❌',
    'ERROR': '💥',
    'WARN': '⚠️'
  }[check.status];
  
  console.log(`${icon} ${check.name}: ${check.status}${check.details ? ` (${check.details})` : ''}`);
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${errors} errors, ${warnings} warnings`);

if (failed > 0 || errors > 0) {
  console.log('\n🚨 System has issues that need attention!');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️ System is mostly healthy but has warnings');
  process.exit(0);
} else {
  console.log('\n🎉 System is healthy!');
  process.exit(0);
}
