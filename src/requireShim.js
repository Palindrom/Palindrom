//used in node --experimental-modules

import { createRequire } from 'module';
import { fileURLToPath as fromURL } from 'url';

const require = createRequire(fromURL(import.meta.url));

export {require};