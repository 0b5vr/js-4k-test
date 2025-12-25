#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

// it just inputs a file from glob pattern
// and outputs its first line (discards following lines)

// =================================================================================================

// -- modules --------------------------------------------------------------------------------------
import { expandGlob } from 'https://deno.land/std@0.221.0/fs/expand_glob.ts';

// -- sanity check ---------------------------------------------------------------------------------
if (Deno.args.length < 2) {
  console.error('Usage: deno run --allow-read --allow-write postprocess.ts *.js output.js');
  Deno.exit(1);
}

// -- main -----------------------------------------------------------------------------------------
console.info('Postprocessing the file...');

const inputMatches = await expandGlob(Deno.args[0]);
const inputPath = (await inputMatches?.next())?.value?.path;
if (!inputPath) {
  console.error(`\x1b[31mGlob did not match: ${Deno.args[0]}\x1b[0m`);
  Deno.exit(1);
}

const inputText = await Deno.readTextFile(inputPath);
const processed = inputText.split('\n')[0];

const outputPath = Deno.args[1];
await Deno.writeTextFile(outputPath, processed);

console.info('Done \x1b[32m✓\x1b[0m');
