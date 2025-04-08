// This script is used by Vercel to ensure Next.js is properly detected
console.log('Setting up application...');
const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = require('./package.json');
console.log('Package.json dependencies:', packageJson.dependencies);

// Verify Next.js is installed
if (packageJson.dependencies.next) {
  console.log(`Next.js version ${packageJson.dependencies.next} detected`);
} else {
  console.error('No Next.js dependency found in package.json');
}

// Create a marker file that Vercel can detect
fs.writeFileSync(
  path.join(__dirname, '.next-version'), 
  packageJson.dependencies.next || '14.1.0'
);

console.log('Setup complete'); 