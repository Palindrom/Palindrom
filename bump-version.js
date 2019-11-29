import fs from 'fs';
// import { version } from './package.json';
import { createRequire } from 'module';
const version = createRequire(import.meta.url)('./package.json').version;

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
