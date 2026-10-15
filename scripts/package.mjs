// Finishes the `nebula sense` output and zips it into release/<name>-<version>.zip, ready to upload to Qlik.
// nebula sense writes only a fixed set of qext fields, so the bundle (the "DI Squared" group in the
// assets panel) and the preview image are added here.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'));
const source = resolve(`${name}-ext`);
const qextPath = resolve(source, `${name}.qext`);
const target = resolve('release', `${name}-${version}.zip`);

const qext = JSON.parse(readFileSync(qextPath, 'utf8'));
qext.preview = 'preview.png';
qext.bundle = {
  id: 'disqr-bundle',
  name: 'DI Squared',
  description: 'Qlik extensions by DI Squared LLC. https://disqr.com',
};
writeFileSync(qextPath, `${JSON.stringify(qext, null, 2)}\n`);
copyFileSync(resolve('assets/preview.png'), resolve(source, 'preview.png'));

mkdirSync('release', { recursive: true });
rmSync(target, { force: true });
if (process.platform === 'win32') {
  execFileSync('powershell', ['-NoProfile', '-Command', `Compress-Archive -Path '${source}\\*' -DestinationPath '${target}'`]);
} else {
  execFileSync('zip', ['-qr', target, '.'], { cwd: source });
}
console.log(`Packaged ${target}`);
