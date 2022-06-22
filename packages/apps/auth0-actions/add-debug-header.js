const { execSync } = require('child_process');
const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { extname, resolve } = require('path');

// We add this header to the Auth0 scripts to make it easier to debug
// what version of the code is actually running.
// We've had issues in the past where it wasn't obvious if changes were
// actually being deployed.
const getDebugHeader = () => {
  try {
    const revision = execSync('git rev-parse HEAD').toString().trim();
    const date = new Date().toISOString();
    return (
      [`// Built from ${revision}`, `// Built at ${date}`].join('\n') + '\n\n'
    );
  } catch (e) {
    console.error("Couldn't parse revision");
    return '';
  }
};

const prependDebugHeader = (directory) =>
  readdirSync(directory).forEach((fileName) => {
    if (extname(fileName) === '.js') {
      const filePath = resolve(directory, fileName);
      const currentData = readFileSync(filePath, { encoding: 'utf8' });
      const newData = getDebugHeader() + currentData;
      writeFileSync(filePath, newData);
    }
  });

prependDebugHeader(process.argv[2]);
