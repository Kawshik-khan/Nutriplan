#!/usr/bin/env node

// Simple test script to verify monolithic setup
console.log('🧪 Testing Nutriplan Monolithic Setup...\n');

// Test 1: Check if directories exist
const fs = require('fs');
const path = require('path');

const requiredDirs = ['frontend', 'backend', 'shared'];
const requiredFiles = [
  'frontend/package.json',
  'backend/package.json',
  'backend/app.js',
  'backend/config/config.js',
  'backend/db.js'
];

console.log('📁 Checking directory structure...');
let allDirsExist = true;
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/ exists`);
  } else {
    console.log(`❌ ${dir}/ missing`);
    allDirsExist = false;
  }
});

console.log('\n📄 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Test 2: Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));

  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
    if (rootPkg.scripts && rootPkg.scripts[script]) {
      console.log(`✅ Root ${script} script exists`);
    } else {
      console.log(`❌ Root ${script} script missing`);
    }
  });

  if (frontendPkg.scripts && frontendPkg.scripts.dev) {
    console.log('✅ Frontend dev script exists');
  }

  if (backendPkg.scripts && backendPkg.scripts.dev) {
    console.log('✅ Backend dev script exists');
  }
} catch (e) {
  console.log('❌ Error reading package.json files:', e.message);
}

// Test 3: Check environment variables
console.log('\n🌍 Checking environment setup...');
if (fs.existsSync('backend/.env')) {
  console.log('✅ Backend .env file exists');
} else {
  console.log('❌ Backend .env file missing');
}

// Summary
console.log('\n📊 Summary:');
if (allDirsExist && allFilesExist) {
  console.log('✅ Basic structure looks good!');
  console.log('🚀 You can now try: npm run install:all');
  console.log('🎯 Then run: npm run dev');
} else {
  console.log('❌ Some files are missing. Please check the setup.');
}