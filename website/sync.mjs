// Copies sources that live elsewhere in the repo, so the site never drifts from them.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { squarePng } from './square-png.mjs';

const context = readFileSync('../CONTEXT.md', 'utf8');
const terms = context.split('## Language')[1];
writeFileSync('glossary.md', `<!-- Generated from CONTEXT.md by sync.mjs. Edit CONTEXT.md instead. -->\n\n# Glossary\n\nThe terms used throughout these docs and the code.\n${terms}`);
copyFileSync('../docs/diagrams/communication-flow.png', 'public/communication-flow.png');
// The mark is taller than wide; browsers stretch non-square favicons, so pad it square.
writeFileSync('public/favicon.png', squarePng(readFileSync('../assets/favicon.png')));
copyFileSync('../assets/favicon.png', 'public/mark.png');
copyFileSync('../assets/disqr-logo-light.png', 'public/disqr-logo-light.png');
copyFileSync('../assets/disqr-logo-dark.png', 'public/disqr-logo-dark.png');
