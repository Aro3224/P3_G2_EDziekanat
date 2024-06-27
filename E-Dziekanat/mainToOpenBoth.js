const fs = require('fs');
const { exec } = require('child_process');
const packageJsonPath = './package.json';
const packageJson = require(packageJsonPath);

// Ustawienie packageJson.main na 'expo-router/entry'
packageJson.main = 'expo-router/entry';
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('packageJson.main has been updated to expo-router/entry');

// Ustawienie packageJson.main na 'main.js' po 10 sekundach i uruchomienie komendy npm run start:electron
setTimeout(() => {
  packageJson.main = 'main.js';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('packageJson.main has been updated to main.js');
  
  exec('npm run start:electron', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}, 10000);
