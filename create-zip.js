const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure we run this from the project root
const projectDir = __dirname;
const releaseDirName = 'ang-pro-release';
const releasePath = path.join(projectDir, '..', releaseDirName);
const zipPath = path.join(projectDir, '..', `${releaseDirName}.zip`);

console.log('Building release package...');

// 1. Create a temporary directory for the release
if (fs.existsSync(releasePath)) {
  fs.rmSync(releasePath, { recursive: true, force: true });
}
fs.mkdirSync(releasePath);

// 2. Define exactly what to copy (added dev.db to preserve data)
const filesToCopy = [
  'src',
  'public',
  'prisma',
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'postcss.config.mjs',
  'tailwind.config.ts',
  'tsconfig.json',
  'eslint.config.mjs',
  'start-ang-pro.bat',
  'README.md',
  'README-TH.txt',
  '.env',
  'dev.db'
];

// Recursive copy function
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    if (exists) {
        fs.copyFileSync(src, dest);
    }
  }
}

// 3. Copy files to the release directory
for (const file of filesToCopy) {
  const srcPath = path.join(projectDir, file);
  const destPath = path.join(releasePath, file);
  if (fs.existsSync(srcPath)) {
    console.log(`Copying ${file}...`);
    copyRecursiveSync(srcPath, destPath);
  } else {
    console.warn(`Warning: ${file} not found, skipping.`);
  }
}

console.log('Files copied successfully.');

// 4. Zip the directory using PowerShell (since this is Windows)
console.log('Compressing to zip file (this might take a few seconds)...');
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

try {
    // Escape paths for PowerShell
    const psCommand = `Compress-Archive -Path "${releasePath}\\*" -DestinationPath "${zipPath}" -Force`;
    execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' });
    console.log(`\n✅ Success! Release file created at: ${zipPath}`);
} catch (error) {
    console.error('Error zipping the file:', error);
} finally {
    // 5. Cleanup the temporary directory
    if (fs.existsSync(releasePath)) {
        fs.rmSync(releasePath, { recursive: true, force: true });
    }
}
