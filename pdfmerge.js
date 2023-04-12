import { readdirSync } from 'fs';
import PDFMerger from 'pdf-merger-js';

const pfdDirName = 'pdfs-to-merge';
async function main() {
  const files = readdirSync(pfdDirName);
  const merger = new PDFMerger();

  for (const file of files) {
    await merger.add(`${pfdDirName}/${file}`);
  }

  await merger.save('js-cheatsheet.pdf');
}

main();
