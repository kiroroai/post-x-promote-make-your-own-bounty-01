// Entry program for make.fun's "Promote make.fun's make-your-own-bounty
// post on X" bounty.
//
// The whole job is deliberately tiny: take the POST.json that sits in the
// bot directory (it names the entrant's post on X) and place an exact copy
// of it in the output directory, where the grader looks for it. Nothing is
// printed on success and the program touches nothing else.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

// Fail loudly (message on stderr, non-zero exit) instead of copying a
// broken entry file or dying with a bare stack trace.
function fail(reason: string): never {
  console.error(`main.ts: ${reason}`);
  process.exit(1);
}

function main(): void {
  const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

  const sourcePath = join(botDir, "POST.json");
  const targetPath = join(outputDir, "POST.json");

  // Read the source as raw bytes so the copy is byte-for-byte identical,
  // whatever whitespace or ordering the file happens to use.
  let payload: Buffer;
  try {
    payload = readFileSync(sourcePath);
  } catch {
    fail(`cannot read ${sourcePath}`);
  }

  // Sanity-check the payload before handing it on: it must be a JSON
  // object whose "url" is a string. The original bytes are still what
  // gets copied — this only guards against an obviously wrong file.
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload.toString("utf8"));
  } catch {
    fail(`${sourcePath} is not valid JSON`);
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { url?: unknown }).url !== "string"
  ) {
    fail(`${sourcePath} must be an object with a string "url"`);
  }

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(targetPath, payload);
}

main();
