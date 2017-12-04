const fs = require('fs');
const version = require('./package.json').version;
try {
  const source = fs.readFileSync('./src/palindrom.js').toString();
  const versionedSource = source.replace(
    /const palindromVersion = .+/,
    `const palindromVersion = '${version}';`
  );
  fs.writeFileSync('./src/palindrom.js', versionedSource);
  console.log(`palindrom.js version was changed to ${version}`);
} catch (e) {
  console.error('Could not bump version in palindrom.js, error:', e);
}
