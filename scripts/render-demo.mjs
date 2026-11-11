import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderScene, sample } from '../scene.js';

const outputDirectory = process.argv[2];
if (!outputDirectory) throw new Error('Provide an output directory for the SVG frames.');
const fps = 24;
const count = sample.duration * fps;

for (let index = 0; index < count; index++) {
  await writeFile(join(outputDirectory, `frame-${String(index).padStart(4, '0')}.svg`),
    renderScene(sample, index / (count - 1)));
}
