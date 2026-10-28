import { randomInt } from "node:crypto";

// No 0/O or 1/I, so references are easy to read aloud and retype.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const LENGTH = 6;

/** A random, hard-to-guess booking reference, e.g. "AC-7F3K9Q". */
export function generateReference(): string {
  let code = "";
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `AC-${code}`;
}
