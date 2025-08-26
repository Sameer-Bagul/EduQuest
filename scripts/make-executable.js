#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔨 Creating executable for EduQuest Desktop Application...\n');

// Step 1: Build the application first
console.log('📦 Building application...');
const build = spawn('node', ['scripts/build-electron.js'], {
  stdio: 'inherit',
  shell: true
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed');
    process.exit(1);
  }

  console.log('✅ Build completed\n');

  // Step 2: Create executable/installer
  console.log('🔧 Creating executable...');
  const makeExecutable = spawn('npm', ['run', 'make'], {
    cwd: path.join(__dirname, '..', 'electron'),
    stdio: 'inherit',
    shell: true
  });

  makeExecutable.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Executable creation failed');
      process.exit(1);
    }

    console.log('✅ Executable created successfully\n');
    console.log('🎉 Complete! Check the electron/out/make directory for:');
    console.log('   - Windows: .exe installer');
    console.log('   - macOS: .app bundle and .zip');
    console.log('   - Linux: .deb and .rpm packages');
  });
});