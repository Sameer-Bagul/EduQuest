#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Building EduQuest Desktop Application...\n');

// Step 1: Build the web application
console.log('📦 Building web application...');
const buildWeb = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildWeb.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Web application build failed');
    process.exit(1);
  }

  console.log('✅ Web application build completed\n');

  // Step 2: Copy necessary files to electron directory
  console.log('📋 Copying files for Electron...');
  
  // Create dist directory in electron folder if it doesn't exist
  const electronDistPath = path.join(__dirname, '..', 'electron', 'dist');
  if (!fs.existsSync(electronDistPath)) {
    fs.mkdirSync(electronDistPath, { recursive: true });
  }

  // Copy built web app to electron/dist
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Files copied successfully\n');
  }

  // Step 3: Install electron dependencies
  console.log('📦 Installing Electron dependencies...');
  const installElectron = spawn('npm', ['install'], {
    cwd: path.join(__dirname, '..', 'electron'),
    stdio: 'inherit',
    shell: true
  });

  installElectron.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Electron dependencies installation failed');
      process.exit(1);
    }

    console.log('✅ Electron dependencies installed\n');

    // Step 4: Package the Electron app
    console.log('🔧 Packaging Electron application...');
    const packageElectron = spawn('npm', ['run', 'pack'], {
      cwd: path.join(__dirname, '..', 'electron'),
      stdio: 'inherit',
      shell: true
    });

    packageElectron.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Electron packaging failed');
        process.exit(1);
      }

      console.log('✅ Electron application packaged successfully\n');
      console.log('🎉 Build completed! Check the electron/out directory for the packaged app.');
    });
  });
});