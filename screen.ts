export function print(str: string) {
  const buf = new TextEncoder().encode(str);
  Deno.stderr.writeSync(buf);
}

export function setAlternateBuffer(mode: boolean) {
  print("\x1b[?1049" + (mode ? "h" : "l"));
}

export function showCursor(mode: boolean) {
  print("\x1b[?25" + (mode ? "h" : "l"));
}
