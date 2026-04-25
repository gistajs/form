import { customAlphabet } from 'nanoid'

/*
  Birthday problem: 50% collision chance at ~2^(n/2) records
  Hex = 4 bits/char
  12 chars = 48 bits → safe up to ~2^24 = 16M records
  16 chars = 64 bits → safe up to ~2^32 = 4B records
  32 chars = 128 bits → safe up to ~2^64 records
*/

const nanoid = customAlphabet('0123456789abcdef')

export function hexid(length = 12) {
  return nanoid(length)
}
