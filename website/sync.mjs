// Copies sources that live elsewhere in the repo, so the site never drifts from them.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

const context = readFileSync('../CONTEXT.md', 'utf8');
const terms = context.split('## Language')[1];
writeFileSync('glossary.md', `<!-- Generated from CONTEXT.md by sync.mjs. Edit CONTEXT.md instead. -->\n\n# Glossary\n\nThe terms used throughout these docs and the code.\n${terms}`);
copyFileSync('../docs/diagrams/communication-flow.png', 'public/communication-flow.png');
